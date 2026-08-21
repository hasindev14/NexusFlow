import ApiError from "../core/ApiError.js";
import asyncHandler from "../core/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../modules/auth/models/user.model.js";

const authenticateUser = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Authentication token is required");
    }

    let decoded;

    try {
        decoded = verifyAccessToken(token);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is inactive");
    }

    req.user = user;

    next();
});

export default authenticateUser;