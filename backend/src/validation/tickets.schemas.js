const { z } = require('zod');

const statuses = ['open', 'in_progress', 'closed'];
const priorities = ['low', 'medium', 'high'];

const optionalEnum = (values) => z.enum(values).optional();
const numericQuery = (fallback) => z.preprocess(
  (value) => value === undefined ? fallback : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  z.number().int().safe()
);
const dateQuery = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
});

const createTicketSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: optionalEnum(statuses),
  priority: optionalEnum(priorities)
}).strict();

const patchTicketSchema = z.object({
  status: optionalEnum(statuses),
  priority: optionalEnum(priorities)
}).strict().refine((value) => value.status !== undefined || value.priority !== undefined, {
  message: 'At least one of status or priority is required'
});

const listTicketsSchema = z.object({
  status: z.enum(statuses).optional(),
  page: numericQuery(1).refine((value) => value >= 1),
  limit: numericQuery(10).refine((value) => value >= 1 && value <= 100),
  search: z.string().trim().max(200).optional(),
  from: dateQuery.optional(),
  to: dateQuery.optional(),
  sortBy: z.enum(['created_at', 'title', 'priority', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).strict().refine((value) => !value.from || !value.to || value.from <= value.to, {
  path: ['to'],
  message: 'End date must be on or after the start date'
});

const ticketIdSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/).refine((value) => Number.isSafeInteger(Number(value)))
}).strict();

module.exports = { createTicketSchema, patchTicketSchema, listTicketsSchema, ticketIdSchema };