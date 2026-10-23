import mysql from 'mysql2/promise';
import env from './env.js';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // Return DECIMAL columns as JS numbers instead of strings
});

export default pool;
