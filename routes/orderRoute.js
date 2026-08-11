import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRole.js";
import validate from "../middlewares/validateMiddleware.js";
import { createOrderSchema } from "../validators/orderValidator.js";
import { cancelOrder, createOrder, getMyOrders, getOrderById, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", authMiddleware, checkRole("admin", "superadmin"), getOrders);

router.get("/my-orders", authMiddleware, checkRole("customer"), getMyOrders);

router.get("/:id", authMiddleware, getOrderById);

router.post("/", authMiddleware, checkRole("customer"), validate(createOrderSchema), createOrder);

router.put("/cancel/:id", authMiddleware, checkRole("customer"), cancelOrder);

export default router;
