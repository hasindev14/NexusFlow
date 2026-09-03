import User from "../../auth/models/user.model.js";
import ApiError from "../../../core/ApiError.js";
import configureCloudinary from "../../../config/cloudinary.js";
import fs from "fs/promises";

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select(
        "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

const updateUserProfile = async (userId, data) => {
    const allowedFields = ["firstName", "lastName", "avatar"];

    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    ).select(
        "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

const uploadUserAvatar = async (userId, file) => {
    if (!file) {
        throw new ApiError(400, "Avatar image is required");
    }

    const user = await User.findById(userId);

    if (!user) {
        await fs.unlink(file.path).catch(() => {});
        throw new ApiError(404, "User not found");
    }

    try {
        // Configure Cloudinary immediately before upload
        const cloudinary = configureCloudinary();

        // Verify configuration
        const config = cloudinary.config();

        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            throw new ApiError(
                500,
                "Cloudinary configuration is incomplete"
            );
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "nexusflow/avatars",
            resource_type: "image",
        });

        // Delete temporary local file
        await fs.unlink(file.path).catch(() => {});

        // Save Cloudinary URL
        user.avatar = result.secure_url;
        await user.save();

        return {
            avatar: user.avatar,
        };
    } catch (error) {
        // Always remove temporary uploaded file
        await fs.unlink(file.path).catch(() => {});

        console.error("Cloudinary avatar upload error:", {
            message: error.message,
            name: error.name,
        });

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            `Avatar upload failed: ${error.message}`
        );
    }
};

export default {
    getUserProfile,
    updateUserProfile,
    uploadUserAvatar,
};