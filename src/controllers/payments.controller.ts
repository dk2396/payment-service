import { Request, Response } from "express";
import { PaymentEventSchema } from "../validation/payment-event.schema";
import { withClient } from "../db/tx";
import { enqueueEvent } from "../repositories/queue.repo";

export async function enqueuePayment(req: Request, res: Response) {
  const parsed = PaymentEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }
  const { event_id, type, invoice_id, amount_cents } = parsed.data;

  await withClient(async (c) => {
    await enqueueEvent(c, event_id, type, { event_id, invoice_id, amount_cents });
  });

  return res.status(202).json({ accepted: true, event_id });
}
