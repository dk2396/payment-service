import { z } from "zod";

export const PaymentEventSchema = z.object({
  event_id: z.string().uuid(),
  type: z.literal("payment"),
  invoice_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
});

export type PaymentEventInput = z.infer<typeof PaymentEventSchema>;