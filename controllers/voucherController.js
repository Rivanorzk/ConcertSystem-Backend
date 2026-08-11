import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

import * as voucherService from "../services/voucherService.js";

export const getVouchers = asyncHandler(async (req, res) => {

    const vouchers =
        await voucherService.getVouchers();

    return success(res, vouchers);

});

export const getVoucherById = asyncHandler(async (req, res) => {

    const voucher =
        await voucherService.getVoucherById(req.params.id);

    return success(res, voucher);

});

export const createVoucher = asyncHandler(async (req, res) => {

    const voucher =
        await voucherService.createVoucher(req.body);

    return success(
        res,
        voucher,
        "Voucher berhasil dibuat",
        201
    );

});

export const updateVoucher = asyncHandler(async (req, res) => {

    const voucher =
        await voucherService.updateVoucher(
            req.params.id,
            req.body
        );

    return success(
        res,
        voucher,
        "Voucher berhasil diperbarui"
    );

});

export const deleteVoucher = asyncHandler(async (req, res) => {

    await voucherService.deleteVoucher(req.params.id);

    return success(
        res,
        null,
        "Voucher berhasil dihapus"
    );

});

export const validateVoucher = asyncHandler(async (req, res) => {

    const voucher =
        await voucherService.validateVoucher(
            req.body.promo_code,
            req.body.total_ticket
        );

    return success(
        res,
        voucher,
        "Voucher valid"
    );

});