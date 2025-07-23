import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import quizReducer from '../features/quiz/quizSlice';
import sessionReducer from '../features/session/sessionSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        quiz: quizReducer,
        session: sessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // for handling non-serializable data like Date objects
        }),
}); 