import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

import * as paymentService from "../services/paymentService.js";

export const createPayment = asyncHandler(async (req, res) => {

    const { order_id } = req.body;

    const payment =
        await paymentService.createPayment(req.user.id, order_id);

    return success(
        res,
        payment,
        "Payment berhasil dibuat",
        201
    );

});

export const paymentCallback = asyncHandler(async (req, res) => {

    await paymentService.paymentCallback(req.body);

    return success(
        res,
        null,
        "Callback berhasil diproses"
    );

});

export const getPayment = asyncHandler(async (req, res) => {

    const { orderId } = req.params;

    const payment =
        await paymentService.getPayment(
            req.user.id,
            req.user.role,
            orderId
        );

    return success(res, payment);

});
