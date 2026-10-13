process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const repository = require('../src/repositories/tickets.repository');

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    const child = require('node:child_process').spawn(
      process.execPath,
      [require.resolve('../scripts/migrate.js')],
      { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'inherit' }
    );
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Migration exited ${code}`)));
  });
});

beforeEach(async () => {
  await pool.execute('DELETE FROM tickets');
});

afterAll(async () => {
  await pool.end();
});

test('creates a ticket with database defaults', async () => {
  const response = await request(app).post('/tickets').send({ title: 'Printer offline' }).expect(201);
  expect(response.body.data).toMatchObject({
    title: 'Printer offline', status: 'open', priority: 'medium'
  });
  expect(response.body.data.id).toBeTruthy();
  expect(response.body.data.created_at).toBeTruthy();
  const detail = await request(app).get(`/tickets/${response.body.data.id}`).expect(200);
  expect(detail.body.data.history).toHaveLength(1);
  expect(detail.body.data.history[0]).toMatchObject({
    event_type: 'created', from_status: null, to_status: 'open'
  });
});

test('rejects a missing title with the documented error shape', async () => {
  const response = await request(app).post('/tickets').send({}).expect(400);
  expect(response.body.error.code).toBe('VALIDATION_ERROR');
  expect(response.body.error.details).toEqual(expect.arrayContaining([
    expect.objectContaining({ field: 'title' })
  ]));
});

test('filters and paginates tickets', async () => {
  await repository.create({ title: 'Open 1', status: 'open' });
  await repository.create({ title: 'Closed', status: 'closed' });
  await repository.create({ title: 'Open 2', status: 'open' });
  const response = await request(app).get('/tickets?status=open&page=1&limit=1').expect(200);
  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].status).toBe('open');
  expect(response.body.meta).toMatchObject({ page: 1, limit: 1, total: 2, totalPages: 2 });
});

test('searches, filters by dates, and sorts ticket results', async () => {
  await repository.create({ title: 'Printer jam west wing', description: 'Paper feed issue', status: 'open' });
  await repository.create({ title: 'Laptop setup', description: 'Printer access needed', status: 'closed' });
  const response = await request(app)
    .get('/tickets?search=printer&from=2020-01-01&to=2035-12-31&sortBy=title&sortOrder=asc')
    .expect(200);
  expect(response.body.data).toHaveLength(2);
  expect(response.body.data.map((ticket) => ticket.title)).toEqual(['Laptop setup', 'Printer jam west wing']);
});

test('updates status and reports invalid and unknown tickets', async () => {
  const created = await repository.create({ title: 'Keyboard issue' });
  const updated = await request(app).patch(`/tickets/${created.id}`).send({ status: 'in_progress' }).expect(200);
  expect(updated.body.data.status).toBe('in_progress');
  const details = await request(app).get(`/tickets/${created.id}`).expect(200);
  expect(details.body.data.history.map((event) => [event.from_status, event.to_status])).toEqual([
    [null, 'open'], ['open', 'in_progress']
  ]);
  expect(details.body.data.history.map((event) => event.event_type)).toEqual(['created', 'status_changed']);
  await request(app).patch('/tickets/999999').send({ status: 'closed' }).expect(404);
  await request(app).patch(`/tickets/${created.id}`).send({ status: 'invalid' }).expect(400);
});

test('returns all stats keys including zero counts', async () => {
  await repository.create({ title: 'Open', status: 'open' });
  await repository.create({ title: 'Done', status: 'closed' });
  const response = await request(app).get('/tickets/stats').expect(200);
  expect(response.body.data).toEqual({ open: 1, in_progress: 0, closed: 1 });
});

test('rejects invalid paging and unsupported patch fields', async () => {
  await request(app).get('/tickets?page=0').expect(400);
  await request(app).patch('/tickets/1').send({ title: 'Not allowed' }).expect(400);
});