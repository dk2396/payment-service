import type { PoolClient } from "pg";


export async function lockInvoice(client: PoolClient, invoiceId: string) {
  await client.query("SELECT pg_advisory_lock(hashtextextended($1, 42))", [invoiceId]);
}
export async function unlockInvoice(client: PoolClient, invoiceId: string) {
  await client.query("SELECT pg_advisory_unlock(hashtextextended($1, 42))", [invoiceId]);
}
