import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["ADMIN", "MEMBER"],
            default: "MEMBER",
        },

        token: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "EXPIRED",
            ],
            default: "PENDING",
        },
    },
    {
        timestamps: true,
    }
);

const Invitation = mongoose.model(
    "Invitation",
    invitationSchema
);

export default Invitation;