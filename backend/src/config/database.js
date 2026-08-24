import { Pool } from "pg";
import env from "./env.js";

const pool = new Pool({
  connectionString: env.databaseUrl,
});

const connectDatabase = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

export {
  pool,
  connectDatabase,
};
