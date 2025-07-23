import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one subscription per user
            index: true
        },
        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free"
        },
        maxParticipants: {
            type: Number,
            default: 50 // free tier limit
        },
        status: {
            type: String,
            enum: ["active", "inactive", "cancelled"],
            default: "inactive"
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date
        },
        razorpaySubscriptionId: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Check if subscription is currently active
subscriptionSchema.methods.isActive = function () {
    return (
        this.status === "active" &&
        (!this.expiresAt || this.expiresAt > new Date())
    );
};

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
