import db from "../lib/database.js";
import AppError from "../utils/AppError.js";
import * as voucherRepository from "../repositories/voucherRepository.js";

export const getVouchers = async () => {

    return await voucherRepository.getVouchers();

};

export const getVoucherById = async (id) => {

    const voucher =
        await voucherRepository.getVoucherById(id);

    if (!voucher) {
        throw new AppError(
            "Voucher tidak ditemukan",
            404
        );
    }

    return voucher;

};

export const createVoucher = async (body) => {

    const existingVoucher =
        await voucherRepository.getVoucherByCode(body.promo_code);

    if (existingVoucher) {
        throw new AppError(
            "Kode voucher sudah digunakan",
            409
        );
    }

    const id =
        await voucherRepository.createVoucher(body);

    return await voucherRepository.getVoucherById(id);

};

export const updateVoucher = async (id, body) => {

    const voucher =
        await voucherRepository.getVoucherById(id);

    if (!voucher) {
        throw new AppError(
            "Voucher tidak ditemukan",
            404
        );
    }

    await voucherRepository.updateVoucher(id, body);

    return await voucherRepository.getVoucherById(id);

};

export const validateVoucher = async (promoCode, totalTicket = 1) => {

    const voucher =
        await voucherRepository.getVoucherByCode(db, promoCode);

    if (!voucher) {
        throw new AppError("Voucher tidak ditemukan", 404);
    }

    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    if (now < startDate || now > endDate) {
        throw new AppError("Voucher sudah tidak berlaku", 400);
    }

    if (voucher.used_quota >= voucher.quota) {
        throw new AppError("Kuota voucher habis", 400);
    }

    if (totalTicket < voucher.minimum_ticket) {
        throw new AppError(
            `Minimal pembelian ${voucher.minimum_ticket} tiket`,
            400
        );
    }

    return voucher;

};

export const deleteVoucher = async (id) => {

    const voucher =
        await voucherRepository.getVoucherById(id);

    if (!voucher) {
        throw new AppError(
            "Voucher tidak ditemukan",
            404
        );
    }

    await voucherRepository.deleteVoucher(id);

};