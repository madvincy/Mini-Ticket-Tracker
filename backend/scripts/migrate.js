const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function migrate() {
  const connection = await mysql.createConnection({ ...config.db, multipleStatements: true });
  try {
    const migrationsPath = path.join(__dirname, '../db/migrations');
    const migrations = (await fs.readdir(migrationsPath))
      .filter((fileName) => fileName.endsWith('.sql'))
      .sort();
    for (const fileName of migrations) {
      const sql = await fs.readFile(path.join(migrationsPath, fileName), 'utf8');
      await connection.query(sql);
      console.log(`Applied ${fileName}`);
    }
    console.log(`Migration applied to ${config.db.database}`);
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed', error);
  process.exitCode = 1;
});