import userService from "../services/user.service.js";
import ApiResponse from "../../../core/ApiResponse.js";
import asyncHandler from "../../../core/asyncHandler.js";

const getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "User profile fetched successfully",
            user
        )
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateUserProfile(
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "User profile updated successfully",
            user
        )
    );
});

const uploadAvatar = asyncHandler(async (req, res) => {
    const result = await userService.uploadUserAvatar(
        req.user._id,
        req.file
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Avatar uploaded successfully",
            result
        )
    );
});

export {
    getProfile,
    updateProfile, uploadAvatar,
};