import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Session } from "../models/session.model.js";
import { Quiz } from "../models/quiz.model.js";

const startSession = asyncHandler(async (req, res) => {
    const { quizId } = req.body;
    const userId = req.user?._id;

    const quiz = await Quiz.findOne({ _id: quizId, creator: userId });
    
    if (!quiz) {
        throw new ApiError(404, "Quiz not found or unauthorized");
    }

    // Check if there's already an active session
    const existingSession = await Session.findOne({
        quiz: quizId,
        status: "active"
    });

    if (existingSession) {
        throw new ApiError(400, "An active session already exists for this quiz");
    }

    const session = await Session.create({
        quiz: quizId,
        host: userId,
        status: "waiting",
        currentQuestion: -1
    });

    return res
        .status(201)
        .json(new ApiResponse(201, session, "Session created successfully"));
});

const joinSession = asyncHandler(async (req, res) => {
    const { accessCode, name } = req.body;
    const userId = req.user?._id; // Optional - anonymous users can join

    const quiz = await Quiz.findOne({ accessCode });
    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    const session = await Session.findOne({
        quiz: quiz._id,
        status: { $in: ["waiting", "active"] }
    });

    if (!session) {
        throw new ApiError(404, "No active session found for this quiz");
    }

    // Check if user already joined
    const existingParticipant = session.participants.find(
        p => p.user?.toString() === userId?.toString() || p.name === name
    );

    if (existingParticipant) {
        throw new ApiError(400, "Already joined this session");
    }

    session.participants.push({
        user: userId,
        name,
        score: 0
    });

    await session.save();

    return res
        .status(200)
        .json(new ApiResponse(200, session, "Joined session successfully"));
});

const submitAnswer = asyncHandler(async (req, res) => {
    const { sessionId, answer } = req.body;
    const userId = req.user?._id;

    const session = await Session.findById(sessionId);
    
    if (!session || session.status !== "active") {
        throw new ApiError(404, "Session not found or not active");
    }

    const participant = session.participants.find(
        p => p.user?.toString() === userId?.toString()
    );

    if (!participant) {
        throw new ApiError(404, "Not a participant in this session");
    }

    // Validate answer submission
    if (typeof answer.questionIndex !== 'number' || 
        typeof answer.selectedOption !== 'number') {
        throw new ApiError(400, "Invalid answer format");
    }

    await session.submitAnswer(participant._id, answer);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Answer submitted successfully"));
});

const getSessionResults = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    const session = await Session.findById(sessionId)
        .populate('quiz', 'title questions')
        .populate('participants.user', 'username avatar');

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Only allow host or participants to view results
    if (session.host.toString() !== userId?.toString() && 
        !session.participants.some(p => p.user?._id.toString() === userId?.toString())) {
        throw new ApiError(403, "Not authorized to view results");
    }

    const results = {
        quiz: {
            title: session.quiz.title,
            totalQuestions: session.quiz.questions.length
        },
        leaderboard: session.getLeaderboard(),
        participants: session.participants.length,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt
    };

    return res
        .status(200)
        .json(new ApiResponse(200, results, "Session results fetched successfully"));
});

export {
    startSession,
    joinSession,
    submitAnswer,
    getSessionResults
}; 