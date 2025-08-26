import type { PoolClient } from "pg";
import { getInvoice, updateInvoiceStatus } from "../repositories/invoices.repo";
import { insertPaymentIdempotent, sumPaymentsForInvoice } from "../repositories/payments.repo";
import { lockInvoice, unlockInvoice } from "../db/locks";


export async function applyPaymentTransaction(
  client: PoolClient,
  payload: { event_id: string; invoice_id: string; amount_cents: number }
) {
  const { event_id, invoice_id, amount_cents } = payload;

  await lockInvoice(client, invoice_id);
  try {
   
    const invoice = await getInvoice(client, invoice_id);
    if (!invoice) throw new Error("Invoice not found");

    await insertPaymentIdempotent(client, event_id, invoice_id, amount_cents);

    const paid = await sumPaymentsForInvoice(client, invoice_id);
    const total = invoice.total_cents;
    const next = paid >= total ? "paid" : paid > 0 ? "partially_paid" : "sent";

    if (next !== invoice.status) {
      await updateInvoiceStatus(client, invoice_id, next);
    }
  } finally {
    await unlockInvoice(client, invoice_id);
  }
}
