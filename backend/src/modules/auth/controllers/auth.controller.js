import authService from "../services/auth.service.js";
import ApiResponse from "../../../core/ApiResponse.js";
import asyncHandler from "../../../core/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            user
        )
    );
});

const login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Login successful",
            result
        )
    );
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Current user fetched successfully",
            user
        )
    );
});

const logout = asyncHandler(async (req, res) => {
    await authService.logoutUser(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Logout successful",
            null
        )
    );
});

const refreshToken = asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(
        req.body.refreshToken
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Access token refreshed successfully",
            result
        )
    );
});

const changePassword = asyncHandler(async (req, res) => {
    const {
        currentPassword,
        newPassword,
    } = req.body;

    await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password changed successfully",
            null
        )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password reset token generated successfully",
            result
        )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const {
        resetToken,
        newPassword,
    } = req.body;

    await authService.resetPassword(
        resetToken,
        newPassword
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password reset successfully",
            null
        )
    );
});
export {
    register,
    login, getMe, logout, refreshToken,changePassword, forgotPassword,
    resetPassword,
};