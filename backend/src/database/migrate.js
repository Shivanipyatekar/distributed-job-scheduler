import fs from "fs";
import path from "path";
import { pool } from "../config/database.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, "../../migrations");

  try {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await pool.query(sql);

      console.log(`Migration completed: ${file}`);
    }

    console.log("All migrations completed successfully");
  } catch (error) {
  console.error("Migration failed");

  console.error("Name:", error?.name);
  console.error("Message:", error?.message);
  console.error("Code:", error?.code);
  console.error("Stack:", error?.stack);

  if (Array.isArray(error?.errors)) {
    console.error("Nested errors:");

    for (const nestedError of error.errors) {
      console.error({
        name: nestedError?.name,
        message: nestedError?.message,
        code: nestedError?.code,
        address: nestedError?.address,
        port: nestedError?.port,
      });
    }
  }

  process.exitCode = 1;
}  
 finally {
    await pool.end();
  }
};

runMigrations();

