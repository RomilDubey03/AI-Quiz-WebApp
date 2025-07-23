import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
    constructor() {
        this.socket = null;
        this.sessionId = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
                withCredentials: true,
            });

            this.setupListeners();
        }
        return this.socket;
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('error', ({ message }) => {
            toast.error(message);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    joinSession(sessionId, name) {
        if (!this.socket) this.connect();
        this.sessionId = sessionId;
        this.socket.emit('join_session', { sessionId, name });
    }

    leaveSession() {
        if (this.socket && this.sessionId) {
            this.socket.emit('leave_session', { sessionId: this.sessionId });
            this.sessionId = null;
        }
    }

    submitAnswer(answer) {
        if (this.socket && this.sessionId) {
            this.socket.emit('submit_answer', {
                sessionId: this.sessionId,
                answer,
            });
        }
    }

    onParticipantJoined(callback) {
        this.socket?.on('participant_joined', callback);
    }

    onParticipantLeft(callback) {
        this.socket?.on('participant_left', callback);
    }

    onQuizStarted(callback) {
        this.socket?.on('quiz_started', callback);
    }

    onNextQuestion(callback) {
        this.socket?.on('next_question', callback);
    }

    onQuizEnded(callback) {
        this.socket?.on('quiz_ended', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.sessionId = null;
        }
    }
}

export default new SocketService(); 