import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import userRoutes from "./routes/userRoute.js";
import eventRoutes from "./routes/eventRoute.js";
import ticketCategoryRoutes from "./routes/ticketCategoryRoute.js";
import eventTicketCategoryRoutes from "./routes/eventTicketCategoryRoute.js";
import voucherRoutes from "./routes/voucherRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import ticketRoutes from "./routes/ticketRoute.js";
import redemptionRoutes from "./routes/redemptionRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import auditlogRoutes from "./routes/auditlogRoute.js";
import notFoundMiddleware from "./middlewares/notFoundMIddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/events", eventRoutes);
app.use("/ticket-categories", ticketCategoryRoutes);
app.use("/event-ticket-categories", eventTicketCategoryRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/tickets", ticketRoutes);
app.use("/redemptions", redemptionRoutes);
app.use("/notifications", notificationRoutes);
app.use("/audit-logs", auditlogRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});