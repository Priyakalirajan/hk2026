const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Run the entire schema file
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('All tables (users, applications, kyc_logs, notifications) are ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    // End the pool so the script exits
    await pool.end();
  }
}

migrate();
