require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'tickets',
    password: process.env.DB_PASSWORD || 'tickets_dev',
    database: isTest
      ? process.env.DB_TEST_NAME || 'lodwar_tickets_test'
      : process.env.DB_NAME || 'lodwar_tickets'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};