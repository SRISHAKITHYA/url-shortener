const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  executeSqlFile: async (filePath) => {
    const sql = fs.readFileSync(path.resolve(__dirname, filePath)).toString();
    await pool.query(sql);
  },
};
