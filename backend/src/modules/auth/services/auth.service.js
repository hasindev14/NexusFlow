import crypto from "crypto";
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

const changePassword = async (
    userId,
    currentPassword,
    newPassword
) => {
    const user = await User.findById(userId).select(
        "+password +refreshToken"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isCurrentPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from current password"
        );
    }

    user.password = await bcrypt.hash(newPassword, 12);

    user.passwordChangedAt = new Date();

    // Invalidate existing refresh token
    user.refreshToken = null;

    await user.save();

    return true;
};

const forgotPassword = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
        throw new ApiError(
            404,
            "No account found with this email"
        );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.passwordResetToken = hashedResetToken;

    user.passwordResetExpires =
        new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    return {
        resetToken,
        expiresIn: "15 minutes",
    };
};

const resetPassword = async (
    resetToken,
    newPassword
) => {
    if (!resetToken) {
        throw new ApiError(
            400,
            "Password reset token is required"
        );
    }

    const hashedResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedResetToken,
        passwordResetExpires: {
            $gt: new Date(),
        },
    }).select(
        "+password +passwordResetToken +passwordResetExpires +refreshToken"
    );

    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired password reset token"
        );
    }

    user.password = await bcrypt.hash(newPassword, 12);

    user.passwordChangedAt = new Date();

    user.passwordResetToken = null;

    user.passwordResetExpires = null;

    user.refreshToken = null;

    await user.save();

    return true;
};
export default {
    registerUser,
    loginUser, getCurrentUser,logoutUser, refreshAccessToken,
    changePassword,forgotPassword,resetPassword,
};