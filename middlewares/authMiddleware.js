import jwt from "jsonwebtoken";

import * as authRepository from "../repositories/authRepository.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Format token tidak valid",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await authRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun telah dinonaktifkan",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

export default authMiddleware;
