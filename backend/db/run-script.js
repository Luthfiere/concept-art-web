const { exec } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const setupSqlPath = path.join(__dirname, 'setup.sql');
const seedScriptPath = path.join(__dirname, 'seeds', 'run-seed.js');
const syncSqlPath = path.join(__dirname, 'sync-seq.sql');

const psqlCommand = `psql "${process.env.DATABASE_URL}" -f "${setupSqlPath}"`;

console.log('Running setup.sql...');
exec(psqlCommand, { env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD } }, (err, stdout, stderr) => {
  if (stderr) console.warn('setup.sql warnings:\n', stderr);
  if (err) {
    console.error('Failed to run setup.sql');
    console.error(stderr);
    process.exit(1);
  }

  console.log('setup.sql completed:\n', stdout);

  console.log('Running run-seed.js...');
  exec(`node "${seedScriptPath}"`, (seedErr, seedOut, seedErrOut) => {
    if (seedErrOut) console.warn('setup.sql warnings:\n', seedErrOut);
    console.log(seedErr);
    if (seedErr) {
      console.error('Seeding failed:');
      console.error(seedErrOut);
      process.exit(1);
    }

    console.log('Seeding completed:\n', seedOut);

    console.log('Running sync-seq.js...');
    exec(`psql "${process.env.DATABASE_URL}" -f "${syncSqlPath}"`, { env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD } }, (syncErr, syncOut, syncErrOut) => {
      if (syncErrOut) console.warn('setup.sql warnings:\n', syncErrOut);
      if (syncErr) {
        console.error('Syncing sequences failed:');
        console.error(syncErrOut);
        process.exit(1);
      }

      console.log('Syncing sequences completed:\n', syncOut);
      console.log('Database setup, seeding, sync completed successfully.');
    });
  });
});
