import type { PoolClient } from "pg";
import { applyPaymentTransaction } from "./payments.service";

export async function handleQueuedEvent(client: PoolClient, row: { event_id: string; event_type: string; payload: any }) {
  if (row.event_type === "payment") {
    const p = row.payload;
    // ensure shape minimally
    await applyPaymentTransaction(client, {
      event_id: p.event_id ?? row.event_id,
      invoice_id: p.invoice_id,
      amount_cents: p.amount_cents,
    });
  } else {
    // extensible for other event types later
  }
}
