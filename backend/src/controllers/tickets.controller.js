const service = require('../services/tickets.service');

async function create(req, res) {
  const ticket = await service.create(req.validated.body);
  return res.status(201).json({ data: ticket });
}

async function list(req, res) {
  const result = await service.list(req.validated.query);
  return res.status(200).json(result);
}

async function details(req, res) {
  const ticket = await service.details(Number(req.validated.params.id));
  return res.status(200).json({ data: ticket });
}

async function update(req, res) {
  const ticket = await service.update(Number(req.validated.params.id), req.validated.body);
  return res.status(200).json({ data: ticket });
}

async function stats(_req, res) {
  const result = await service.stats();
  return res.status(200).json({ data: result });
}

module.exports = { create, list, details, update, stats };