import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRole.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createVoucherSchema,
  updateVoucherSchema,
  validateVoucherSchema
} from "../validators/voucherValidator.js";

import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher
} from "../controllers/voucherController.js";

const router = express.Router();

router.get("/", getVouchers);

router.get("/:id", getVoucherById);

router.post(
  "/",
  authMiddleware,
  checkRole("admin", "superadmin"),
  validate(createVoucherSchema),
  createVoucher
);

router.put(
  "/:id",
  authMiddleware,
  checkRole("admin", "superadmin"),
  validate(updateVoucherSchema),
  updateVoucher
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole("superadmin"),
  deleteVoucher
);

router.post("/validate", validate(validateVoucherSchema), validateVoucher);

export default router;
