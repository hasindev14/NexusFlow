import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
            maxlength: [50, "First name cannot exceed 50 characters"],
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },

        avatar: {
            url: {
                type: String,
                default: "",
            },
            publicId: {
                type: String,
                default: "",
            },
        },

        role: {
            type: String,
            enum: [
                "SUPER_ADMIN",
                "ORG_ADMIN",
                "PROJECT_MANAGER",
                "TEAM_LEAD",
                "DEVELOPER",
                "QA_ENGINEER",
                "DESIGNER",
                "VIEWER",
                "CLIENT",
            ],
            default: "DEVELOPER",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            select: false,
            default: null,
        },

        passwordChangedAt: {
            type: Date,
            select: false,
            default: null,
        },

        passwordResetToken: {
            type: String,
            select: false,
            default: null,
        },

        passwordResetExpires: {
            type: Date,
            select: false,
            default: null,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User