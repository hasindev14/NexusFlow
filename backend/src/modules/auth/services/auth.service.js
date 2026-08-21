import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import ApiError from "../../../core/ApiError.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../../utils/jwt.js";

const registerUser = async ({
    firstName,
    lastName,
    email,
    password,
}) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existingUser) {
        throw new ApiError(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "DEVELOPER",
    });

    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
    };
};

const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();

    await user.save();

    return {
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken,
    };
};

const getCurrentUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

const logoutUser = async (userId) => {
    const user = await User.findById(userId).select("+refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.refreshToken = null;

    await user.save();

    return true;
};


const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user) {
        throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is inactive");
    }

    if (!user.refreshToken) {
        throw new ApiError(401, "Refresh token has been revoked");
    }

    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(
        user._id.toString()
    );

    const newRefreshToken = generateRefreshToken(
        user._id.toString()
    );

    user.refreshToken = newRefreshToken;

    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
export default {
    registerUser,
    loginUser, getCurrentUser,logoutUser, refreshAccessToken,
};