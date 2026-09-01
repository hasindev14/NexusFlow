import express from "express";

import {
    getProfile,
    updateProfile,
} from "../controllers/user.controller.js";

import authenticateUser from "../../../middlewares/auth.middleware.js";

import validate from "../../../middlewares/validate.middleware.js";

import {
    updateProfileSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.get(
    "/me",
    authenticateUser,
    getProfile
);

router.patch(
    "/me",
    authenticateUser,
    validate(updateProfileSchema),
    updateProfile
);

export default router;