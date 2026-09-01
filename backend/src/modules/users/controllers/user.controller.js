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

export {
    getProfile,
    updateProfile,
};