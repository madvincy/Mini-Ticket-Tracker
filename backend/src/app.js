const express = require('express');
const cors = require('cors');
const config = require('./config');
const ticketsRoutes = require('./routes/tickets.routes');
const errorHandler = require('./middleware/error-handler');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.get('/health', (_req, res) => res.status(200).json({ data: { status: 'ok' } }));
app.get('/api-docs.json', (_req, res) => res.status(200).json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/tickets', ticketsRoutes);
app.use(errorHandler);

module.exports = app;