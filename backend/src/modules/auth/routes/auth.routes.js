import express from "express";

import {
    register,
    login,
    getMe,
    logout,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";

import {
    registerSchema,
    loginSchema,
} from "../validations/auth.validation.js";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import authorizeRoles from "../../../middlewares/authorization.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/refresh-token",
    refreshToken
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password",
    resetPassword
);

router.get(
    "/me",
    authenticateUser,
    authorizeRoles("DEVELOPER"),
    getMe
);

router.post(
    "/logout",
    authenticateUser,
    logout
);

router.patch(
    "/change-password",
    authenticateUser,
    changePassword
);

export default router;