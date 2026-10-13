const pool = require('../db/pool');

async function create(ticket) {
  const [result] = await pool.execute(
    'INSERT INTO tickets (title, description, status, priority) VALUES (?, ?, ?, ?)',
    [ticket.title, ticket.description ?? null, ticket.status ?? 'open', ticket.priority ?? 'medium']
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, title, description, status, priority, created_at FROM tickets WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findPage({ status, limit, offset }) {
  const where = status ? 'WHERE status = ?' : '';
  const values = status ? [status] : [];
  const [rowsResult, countResult] = await Promise.all([
    pool.execute(
      `SELECT id, title, description, status, priority, created_at FROM tickets ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    ),
    pool.execute(`SELECT COUNT(*) AS total FROM tickets ${where}`, values)
  ]);
  return { rows: rowsResult[0], total: countResult[0][0].total };
}

async function update(id, changes) {
  const fields = Object.keys(changes).filter((field) => ['status', 'priority'].includes(field));
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  await pool.execute(`UPDATE tickets SET ${assignments} WHERE id = ?`, [
    ...fields.map((field) => changes[field]), id
  ]);
  return findById(id);
}

async function countByStatus() {
  const [rows] = await pool.execute('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status');
  return rows;
}

module.exports = { create, findById, findPage, update, countByStatus };