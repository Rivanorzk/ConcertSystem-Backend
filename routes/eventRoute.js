import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRole.js";
import validate from "../middlewares/validateMiddleware.js";
import { createEventSchema, updateEventSchema } from "../validators/eventValidator.js";

import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post(
    "/",
    authMiddleware,
    checkRole("admin", "superadmin"),
    validate(createEventSchema),
    createEvent
);

router.put(
    "/:id",
    authMiddleware,
    checkRole("admin", "superadmin"),
    validate(updateEventSchema),
    updateEvent
);

router.delete(
    "/:id",
    authMiddleware,
    checkRole("admin","superadmin"),
    deleteEvent
);

export default router;
