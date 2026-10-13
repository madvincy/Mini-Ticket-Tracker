const request = require('supertest');
const app = require('../src/app');

test('serves the OpenAPI document without connecting to MySQL', async () => {
  const response = await request(app).get('/api-docs.json').expect(200);
  expect(response.body.openapi).toBe('3.0.3');
  expect(response.body.paths).toHaveProperty('/tickets');
  expect(response.body.paths).toHaveProperty('/tickets/stats');
  expect(response.body.paths).toHaveProperty('/tickets/{id}');
  expect(response.body.components.schemas.TicketStatus.enum).toEqual(['open', 'in_progress', 'closed']);
});

test('serves the interactive Swagger UI', async () => {
  const response = await request(app).get('/api-docs/').expect(200);
  expect(response.text).toContain('swagger-ui');
});