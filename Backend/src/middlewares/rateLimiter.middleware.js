import redisService from "../services/redis.service.js";
import { ApiError } from "../utils/ApiError.js";

const createRateLimiter = (limit, windowSeconds, errorMessage) => {
    return async (req, res, next) => {
        try {
            const key = `rate_limit:${req.ip}:${req.path}`;
            const isAllowed = await redisService.checkRateLimit(key, limit, windowSeconds);

            if (!isAllowed) {
                throw new ApiError(429, errorMessage || "Too many requests. Please try again later.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Different rate limiters for different routes
export const authRateLimiter = createRateLimiter(
    5,     // 5 requests
    60,    // per minute
    "Too many login attempts. Please try again later."
);

export const quizRateLimiter = createRateLimiter(
    30,    // 30 requests
    60,    // per minute
    "Too many quiz requests. Please try again later."
);

export const aiGenerateRateLimiter = createRateLimiter(
    5,     // 5 requests
    300,   // per 5 minutes
    "AI generation limit reached. Please try again later."
);

export const sessionRateLimiter = createRateLimiter(
    60,    // 60 requests
    60,    // per minute
    "Too many session requests. Please try again later."
); 