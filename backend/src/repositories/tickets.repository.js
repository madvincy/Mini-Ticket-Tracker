const pool = require('../db/pool');

async function create(ticket) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const status = ticket.status ?? 'open';
    const [result] = await connection.execute(
      'INSERT INTO tickets (title, description, status, priority) VALUES (?, ?, ?, ?)',
      [ticket.title, ticket.description ?? null, status, ticket.priority ?? 'medium']
    );
    await connection.execute(
      'INSERT INTO ticket_status_history (ticket_id, event_type, from_status, to_status) VALUES (?, \'created\', NULL, ?)',
      [result.insertId, status]
    );
    const [rows] = await connection.execute(
      'SELECT id, title, description, status, priority, created_at FROM tickets WHERE id = ?',
      [result.insertId]
    );
    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, title, description, status, priority, created_at FROM tickets WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findDetails(id) {
  const [ticket] = await Promise.all([findById(id)]);
  if (!ticket) return null;
  const [history] = await pool.execute(
    'SELECT id, event_type, from_status, to_status, changed_at FROM ticket_status_history WHERE ticket_id = ? ORDER BY changed_at ASC, id ASC',
    [id]
  );
  return { ...ticket, history };
}

async function findPage({ status, search, from, to, sortBy, sortOrder, limit, offset }) {
  const clauses = [];
  const values = [];
  if (status) {
    clauses.push('status = ?');
    values.push(status);
  }
  if (search) {
    clauses.push('(title LIKE ? OR description LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }
  if (from) {
    clauses.push('created_at >= ?');
    values.push(`${from} 00:00:00`);
  }
  if (to) {
    clauses.push('created_at < DATE_ADD(?, INTERVAL 1 DAY)');
    values.push(`${to} 00:00:00`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sortColumns = { created_at: 'created_at', title: 'title', priority: 'priority', status: 'status' };
  const sortColumn = sortColumns[sortBy] || sortColumns.created_at;
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderBy = sortColumn === 'created_at'
    ? `${sortColumn} ${direction}, id ${direction}`
    : `${sortColumn} ${direction}, created_at DESC, id DESC`;
  const [rowsResult, countResult] = await Promise.all([
    pool.execute(
      `SELECT id, title, description, status, priority, created_at FROM tickets ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    ),
    pool.execute(`SELECT COUNT(*) AS total FROM tickets ${where}`, values)
  ]);
  return { rows: rowsResult[0], total: countResult[0][0].total };
}

async function update(id, changes) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      'SELECT id, title, description, status, priority, created_at FROM tickets WHERE id = ? FOR UPDATE',
      [id]
    );
    const existing = existingRows[0];
    if (!existing) {
      await connection.commit();
      return null;
    }
    const fields = Object.keys(changes).filter((field) => ['status', 'priority'].includes(field));
    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    await connection.execute(`UPDATE tickets SET ${assignments} WHERE id = ?`, [
      ...fields.map((field) => changes[field]), id
    ]);
    if (changes.status && changes.status !== existing.status) {
      await connection.execute(
        'INSERT INTO ticket_status_history (ticket_id, event_type, from_status, to_status) VALUES (?, \'status_changed\', ?, ?)',
        [id, existing.status, changes.status]
      );
    }
    const [rows] = await connection.execute(
      'SELECT id, title, description, status, priority, created_at FROM tickets WHERE id = ?',
      [id]
    );
    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function countByStatus() {
  const [rows] = await pool.execute('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status');
  return rows;
}

module.exports = { create, findById, findDetails, findPage, update, countByStatus };