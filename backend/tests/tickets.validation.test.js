const {
  createTicketSchema,
  patchTicketSchema,
  listTicketsSchema,
  ticketIdSchema
} = require('../src/validation/tickets.schemas');

test('trims a valid title and accepts optional ticket fields', () => {
  const result = createTicketSchema.safeParse({ title: '  Printer offline  ', priority: 'high' });
  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({ title: 'Printer offline', priority: 'high' });
});

test('rejects blank titles and fields outside the create contract', () => {
  expect(createTicketSchema.safeParse({ title: '   ' }).success).toBe(false);
  expect(createTicketSchema.safeParse({ title: 'Valid', extra: true }).success).toBe(false);
});

test('requires at least one supported patch field', () => {
  expect(patchTicketSchema.safeParse({}).success).toBe(false);
  expect(patchTicketSchema.safeParse({ status: 'closed', priority: 'high' }).success).toBe(true);
  expect(patchTicketSchema.safeParse({ title: 'Nope' }).success).toBe(false);
});

test('applies paging defaults and rejects out-of-range values', () => {
  expect(listTicketsSchema.parse({})).toEqual({ page: 1, limit: 10 });
  expect(listTicketsSchema.safeParse({ page: '0', limit: '101' }).success).toBe(false);
  expect(listTicketsSchema.safeParse({ status: 'pending' }).success).toBe(false);
});

test('accepts only positive safe integer path ids', () => {
  expect(ticketIdSchema.safeParse({ id: '12' }).success).toBe(true);
  expect(ticketIdSchema.safeParse({ id: '0' }).success).toBe(false);
  expect(ticketIdSchema.safeParse({ id: '1.2' }).success).toBe(false);
});