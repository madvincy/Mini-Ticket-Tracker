const app = require('./app');
const pool = require('./db/pool');
const config = require('./config');

pool.query('SELECT 1')
  .then(() => app.listen(config.port, () => console.log(`API listening on port ${config.port}`)))
  .catch((error) => {
    console.error('Unable to connect to MySQL', error);
    process.exit(1);
  });