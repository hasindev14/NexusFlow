import express from "express";

import {
    register,
    login,
    getMe,
    logout,
    refreshToken,
} from "../controllers/auth.controller.js";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import authorizeRoles from "../../../middlewares/authorization.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

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

export default router;