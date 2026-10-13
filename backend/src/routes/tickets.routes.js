const express = require('express');
const controller = require('../controllers/tickets.controller');
const validate = require('../middleware/validate');
const {
  createTicketSchema,
  patchTicketSchema,
  listTicketsSchema,
  ticketIdSchema
} = require('../validation/tickets.schemas');

const router = express.Router();

router.post('/', validate(createTicketSchema, 'body'), controller.create);
router.get('/stats', controller.stats);
router.get('/', validate(listTicketsSchema, 'query'), controller.list);
router.get('/:id', validate(ticketIdSchema, 'params'), controller.details);
router.patch('/:id', validate(ticketIdSchema, 'params'), validate(patchTicketSchema, 'body'), controller.update);

module.exports = router;