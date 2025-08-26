import type { PoolClient } from "pg";

export async function insertPaymentIdempotent(
  client: PoolClient,
  eventId: string,
  invoiceId: string,
  amountCents: number
) {
  await client.query(
    `INSERT INTO payments(event_id, invoice_id, amount_cents)
     VALUES ($1,$2,$3) ON CONFLICT (event_id) DO NOTHING`,
    [eventId, invoiceId, amountCents]
  );
}

export async function sumPaymentsForInvoice(client: PoolClient, invoiceId: string) {
  const r = await client.query(
    "SELECT COALESCE(SUM(amount_cents),0)::int AS total FROM payments WHERE invoice_id=$1",
    [invoiceId]
  );
  return (r.rows[0]?.total ?? 0) as number;
}
