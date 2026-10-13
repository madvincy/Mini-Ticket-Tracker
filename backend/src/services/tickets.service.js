const HttpError = require('../errors/http-error');
const repository = require('../repositories/tickets.repository');

const statuses = ['open', 'in_progress', 'closed'];

async function create(ticket) {
  return repository.create(ticket);
}

async function list({ status, search, from, to, sortBy, sortOrder, page, limit }) {
  const result = await repository.findPage({
    status, search, from, to, sortBy, sortOrder, limit, offset: (page - 1) * limit
  });
  return {
    data: result.rows,
    meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) }
  };
}

async function details(id) {
  const ticket = await repository.findDetails(id);
  if (!ticket) throw new HttpError(404, 'NOT_FOUND', 'Ticket not found');
  return ticket;
}

async function update(id, changes) {
  const ticket = await repository.update(id, changes);
  if (!ticket) throw new HttpError(404, 'NOT_FOUND', 'Ticket not found');
  return ticket;
}

async function stats() {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  for (const row of await repository.countByStatus()) counts[row.status] = row.count;
  return counts;
}

module.exports = { create, list, details, update, stats };