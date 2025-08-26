import { pool } from "./pool";
import type { PoolClient } from "pg";

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// export async function withTransaction<T>(fn: (c: PoolClient) => Promise<T>) {
//   return withClient(async (c) => {
//     await c.query("BEGIN");
//     try {
//       const out = await fn(c);
//       await c.query("COMMIT");
//       return out;
//     } catch (e) {
//       await c.query("ROLLBACK");
//       throw e;
//     }
//   });
// }
