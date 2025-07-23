import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    score: {
        type: Number,
        default: 0
    }
});

const sessionSchema = new Schema(
    {
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
            index: true
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ["waiting", "active", "completed"],
            default: "waiting"
        },
        participants: {
            type: [participantSchema],
            default: []
        },
        currentQuestion: {
            type: Number,
            default: -1 // -1 means not started
        },
        startedAt: {
            type: Date
        },
        endedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Start session
sessionSchema.methods.start = function () {
    if (this.status !== "waiting") {
        throw new Error("Session already started");
    }
    this.status = "active";
    this.currentQuestion = 0;
    this.startedAt = new Date();
    return this.save();
};

// End session
sessionSchema.methods.end = function () {
    this.status = "completed";
    this.endedAt = new Date();
    return this.save();
};

// Add participant
sessionSchema.methods.addParticipant = function (participant) {
    if (this.status === "completed") {
        throw new Error("Session ended");
    }
    this.participants.push(participant);
    return this.save();
};

export const Session = mongoose.model("Session", sessionSchema);
