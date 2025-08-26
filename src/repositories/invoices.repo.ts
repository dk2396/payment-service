import type { PoolClient } from "pg";

export async function getInvoice(client: PoolClient, invoiceId: string) {
  const r = await client.query("SELECT id, total_cents, status FROM invoices WHERE id=$1", [invoiceId]);
  return r.rows[0] as { id: string; total_cents: number; status: "sent"|"partially_paid"|"paid" } | undefined;
}

export async function updateInvoiceStatus(client: PoolClient, invoiceId: string, status: string) {
  await client.query("UPDATE invoices SET status=$1 WHERE id=$2", [status, invoiceId]);
}
