import { Router } from "express";
import { enqueuePayment } from "../controllers/payments.controller";

const router = Router();
router.post("/webhooks/payments", enqueuePayment);
export default router;
