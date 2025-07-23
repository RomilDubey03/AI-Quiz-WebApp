import { Router } from "express";
import {
    createQuiz,
    generateAIQuiz,
    getQuizByCode,
    updateQuiz,
    deleteQuiz
} from "../controllers/quiz.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { quizRateLimiter, aiGenerateRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Protected routes with rate limiting
router.route("/create").post(
    verifyJWT,
    quizRateLimiter,
    createQuiz
);

router.route("/ai-generate").post(
    verifyJWT,
    aiGenerateRateLimiter,
    generateAIQuiz
);

router.route("/:quizId")
    .patch(verifyJWT, quizRateLimiter, updateQuiz)
    .delete(verifyJWT, quizRateLimiter, deleteQuiz);

// Public routes with rate limiting
router.route("/code/:accessCode").get(
    quizRateLimiter,
    getQuizByCode
);

export default router; 