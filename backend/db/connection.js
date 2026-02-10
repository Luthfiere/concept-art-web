const { Pool } = require("pg");
const path = require("path");
const dotenv = require("dotenv");

// 1. Load environment file based on NODE_ENV
const ENV = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(__dirname, `../.env.${ENV}`) });

// 2. Validate the environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment.");
}

// 3. Create the PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ENV === "production" ? { rejectUnauthorized: false } : false
});

// 4. Export the pool
module.exports = pool;
