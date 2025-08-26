// migrations/run.ts
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { pool } from "../src/db/pool";

async function run() {
  const dir = join(process.cwd(), "migrations");
  const files = readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const f of files) {
      const sql = readFileSync(join(dir, f), "utf8");
      console.log(`Applying ${f}...`);
      await client.query(sql);
    }
    await client.query("COMMIT");
    console.log("Migrations applied.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
