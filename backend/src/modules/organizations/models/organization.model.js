import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                role: {
                    type: String,
                    enum: ["OWNER", "ADMIN", "MEMBER"],
                    default: "MEMBER",
                },

                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Organization = mongoose.model(
    "Organization",
    organizationSchema
);

export default Organization;