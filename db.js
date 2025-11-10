// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST    || '127.0.0.1',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  query: (sql, params) =>
    // pool.query calls mysql.format under the hood,
    // so both ? and ?? placeholders will work
    pool.query(sql, params)
        .then(([rows /*, fields*/]) => rows),

  close: () => pool.end(),
};
