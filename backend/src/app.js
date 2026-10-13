const express = require('express');
const cors = require('cors');
const config = require('./config');
const ticketsRoutes = require('./routes/tickets.routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.get('/health', (_req, res) => res.status(200).json({ data: { status: 'ok' } }));
app.use('/tickets', ticketsRoutes);
app.use(errorHandler);

module.exports = app;