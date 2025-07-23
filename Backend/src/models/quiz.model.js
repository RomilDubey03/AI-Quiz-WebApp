import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: [
        {
            type: String,
            required: true,
            trim: true
        }
    ],
    correctIndex: {
        type: Number,
        required: true
    }
});

const quizSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            trim: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        isAIGenerated: {
            type: Boolean,
            default: false
        },
        questions: [questionSchema],
        timePerQuestion: {
            type: Number, // seconds
            default: 60
        },
        accessCode: {
            type: String,
            unique: true,
            index: true
        },
        status: {
            type: String,
            enum: ["draft", "active", "completed"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

// Generate unique access code before save if missing
quizSchema.pre("save", function (next) {
    if (!this.accessCode) {
        this.accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

export const Quiz = mongoose.model("Quiz", quizSchema);
