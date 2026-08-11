import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import AppError from "../utils/AppError.js";

import * as userService from "../services/userService.js";

const isStaff = (role) => ["admin", "superadmin"].includes(role);

export const getUsers = asyncHandler(async (req, res) => {

    const users = await userService.getUsers();

    return success(res, users);

});

export const getUserById = asyncHandler(async (req, res) => {

    if (
        String(req.user.id) !== String(req.params.id) &&
        !isStaff(req.user.role)
    ) {
        throw new AppError("Anda tidak memiliki akses ke data ini", 403);
    }

    const user =
        await userService.getUserById(
            req.params.id
        );

    return success(res, user);

});

export const getMyProfile = asyncHandler(async (req, res) => {

    const user = await userService.getUserById(
        req.user.id
    );

    return success(res, user);

});

export const updateMyProfile = asyncHandler(async (req, res) => {

    const user = await userService.updateProfile(
        req.user.id,
        req.body
    );

    return success(
        res,
        user,
        "Profile berhasil diperbarui"
    );

});

export const updateMyPassword = asyncHandler(async (req, res) => {

    await userService.updatePassword(
        req.user.id,
        req.body.password
    );

    return success(
        res,
        null,
        "Password berhasil diperbarui"
    );

});

export const updateRole = asyncHandler(async (req, res) => {

    const user =
        await userService.updateRole(
            req.params.id,
            req.body.role
        );

    return success(
        res,
        user,
        "Role berhasil diperbarui"
    );

});

export const updateStatus = asyncHandler(async (req, res) => {

    const user =
        await userService.updateStatus(
            req.params.id,
            req.body.status,
            req.body.is_active
        );

    return success(
        res,
        user,
        "Status berhasil diperbarui"
    );

});

export const deleteUser = asyncHandler(async (req, res) => {

    await userService.deleteUser(
        req.params.id
    );

    return success(
        res,
        null,
        "User berhasil dihapus"
    );

});
