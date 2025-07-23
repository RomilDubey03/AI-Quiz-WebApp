import { Router } from "express";
import {
    startSession,
    joinSession,
    submitAnswer,
    getSessionResults
} from "../controllers/session.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sessionRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Host routes with rate limiting
router.route("/start").post(
    verifyJWT,
    sessionRateLimiter,
    startSession
);

// Participant routes with rate limiting
router.route("/join").post(
    sessionRateLimiter,
    joinSession
);

router.route("/:sessionId/submit").post(
    verifyJWT,
    sessionRateLimiter,
    submitAnswer
);

router.route("/:sessionId/results").get(
    verifyJWT,
    sessionRateLimiter,
    getSessionResults
);

export default router; 