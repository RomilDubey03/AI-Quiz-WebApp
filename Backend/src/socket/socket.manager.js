import { Server } from "socket.io";
import { createClient } from "redis";
import { Session } from "../models/session.model.js";

class SocketManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN,
                credentials: true
            }
        });

        this.redis = createClient({
            url: process.env.REDIS_URL
        });

        this.setupRedis();
        this.setupSocketEvents();
    }

    async setupRedis() {
        await this.redis.connect();
        console.log("Redis connected successfully");
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Join quiz session room
            socket.on("join_session", async ({ sessionId, name }) => {
                try {
                    const session = await Session.findById(sessionId);
                    if (!session) {
                        socket.emit("error", { message: "Session not found" });
                        return;
                    }

                    socket.join(sessionId);
                    socket.sessionId = sessionId;
                    socket.participantName = name;

                    // Store participant in Redis
                    await this.redis.hSet(
                        `session:${sessionId}:participants`,
                        socket.id,
                        JSON.stringify({ name, joinedAt: new Date() })
                    );

                    // Broadcast to room
                    this.io.to(sessionId).emit("participant_joined", {
                        name,
                        totalParticipants: await this.getParticipantCount(sessionId)
                    });

                } catch (error) {
                    socket.emit("error", { message: "Could not join session" });
                }
            });

            // Host starts quiz
            socket.on("start_quiz", async ({ sessionId }) => {
                try {
                    const session = await Session.findById(sessionId);
                    if (!session) {
                        socket.emit("error", { message: "Session not found" });
                        return;
                    }

                    await session.start();
                    
                    // Start quiz timer in Redis
                    await this.redis.set(
                        `session:${sessionId}:currentQuestion`,
                        0,
                        'EX',
                        session.timePerQuestion
                    );

                    this.io.to(sessionId).emit("quiz_started", {
                        currentQuestion: 0,
                        timePerQuestion: session.timePerQuestion
                    });

                } catch (error) {
                    socket.emit("error", { message: "Could not start quiz" });
                }
            });

            // Submit answer
            socket.on("submit_answer", async ({ sessionId, answer }) => {
                try {
                    const session = await Session.findById(sessionId);
                    if (!session) {
                        socket.emit("error", { message: "Session not found" });
                        return;
                    }

                    // Store answer in Redis
                    await this.redis.hSet(
                        `session:${sessionId}:answers:${session.currentQuestion}`,
                        socket.id,
                        JSON.stringify(answer)
                    );

                    // Check if all participants answered
                    const answersCount = await this.redis.hLen(
                        `session:${sessionId}:answers:${session.currentQuestion}`
                    );
                    const participantsCount = await this.getParticipantCount(sessionId);

                    if (answersCount >= participantsCount) {
                        // Move to next question
                        await this.moveToNextQuestion(sessionId);
                    }

                } catch (error) {
                    socket.emit("error", { message: "Could not submit answer" });
                }
            });

            // Disconnect handling
            socket.on("disconnect", async () => {
                if (socket.sessionId) {
                    await this.redis.hDel(
                        `session:${socket.sessionId}:participants`,
                        socket.id
                    );

                    this.io.to(socket.sessionId).emit("participant_left", {
                        name: socket.participantName,
                        totalParticipants: await this.getParticipantCount(socket.sessionId)
                    });
                }
            });
        });
    }

    async getParticipantCount(sessionId) {
        return await this.redis.hLen(`session:${sessionId}:participants`);
    }

    async moveToNextQuestion(sessionId) {
        try {
            const session = await Session.findById(sessionId);
            if (!session) return;

            const nextQuestion = session.currentQuestion + 1;
            
            if (nextQuestion >= session.quiz.questions.length) {
                // End quiz
                await session.end();
                this.io.to(sessionId).emit("quiz_ended", {
                    leaderboard: await session.getLeaderboard()
                });
                return;
            }

            // Update session and notify participants
            session.currentQuestion = nextQuestion;
            await session.save();

            // Set timer for next question
            await this.redis.set(
                `session:${sessionId}:currentQuestion`,
                nextQuestion,
                'EX',
                session.timePerQuestion
            );

            this.io.to(sessionId).emit("next_question", {
                questionNumber: nextQuestion,
                timePerQuestion: session.timePerQuestion
            });

        } catch (error) {
            console.error("Error moving to next question:", error);
        }
    }
}

export default SocketManager; 