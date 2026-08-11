import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRole.js";
import validate from "../middlewares/validateMiddleware.js";
import { createPaymentSchema } from "../validators/paymentValidator.js";

import {
  createPayment,
  paymentCallback,
  getPayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  checkRole("customer"),
  validate(createPaymentSchema),
  createPayment
);

router.post("/callback", paymentCallback);

router.get(
  "/order/:orderId",
  authMiddleware,
  getPayment
);

export default router;
