import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateAccountDetails,
    getCreatorDashboard,
    getQuizDetails
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Public routes with rate limiting
router.route("/register").post(
    authRateLimiter,
    upload.single("avatar"),
    registerUser
);

router.route("/login").post(
    authRateLimiter,
    loginUser
);

router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Dashboard routes
router.route("/dashboard").get(verifyJWT, getCreatorDashboard);
router.route("/quiz/:quizId").get(verifyJWT, getQuizDetails);

export default router;