import { createClient } from "redis";

class RedisService {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL
        });
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            console.log("Redis connected successfully");
        } catch (error) {
            console.error("Redis connection error:", error);
        }
    }

    // Cache quiz data
    async cacheQuiz(quizId, quizData, expirySeconds = 3600) {
        await this.client.setEx(
            `quiz:${quizId}`,
            expirySeconds,
            JSON.stringify(quizData)
        );
    }

    async getCachedQuiz(quizId) {
        const quiz = await this.client.get(`quiz:${quizId}`);
        return quiz ? JSON.parse(quiz) : null;
    }

    // Rate limiting
    async checkRateLimit(key, limit, windowSeconds) {
        const current = await this.client.incr(key);
        
        if (current === 1) {
            await this.client.expire(key, windowSeconds);
        }

        return current <= limit;
    }

    // Session tracking
    async trackUserSession(userId, sessionData, expirySeconds = 7200) {
        await this.client.setEx(
            `user_session:${userId}`,
            expirySeconds,
            JSON.stringify(sessionData)
        );
    }

    async getUserSession(userId) {
        const session = await this.client.get(`user_session:${userId}`);
        return session ? JSON.parse(session) : null;
    }

    // Leaderboard caching
    async cacheLeaderboard(sessionId, leaderboardData, expirySeconds = 3600) {
        await this.client.setEx(
            `leaderboard:${sessionId}`,
            expirySeconds,
            JSON.stringify(leaderboardData)
        );
    }

    async getCachedLeaderboard(sessionId) {
        const leaderboard = await this.client.get(`leaderboard:${sessionId}`);
        return leaderboard ? JSON.parse(leaderboard) : null;
    }

    // Clear cache
    async clearQuizCache(quizId) {
        await this.client.del(`quiz:${quizId}`);
    }

    async clearUserSession(userId) {
        await this.client.del(`user_session:${userId}`);
    }
}

export default new RedisService(); 