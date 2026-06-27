import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    getMe,
} from "../controllers/auth.controller.js";

import {
    protectRoute,
    protectAdminRoute,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", protectAdminRoute, register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refreshToken);

router.get(
    "/me",
    protectRoute,
    getMe
);

export default router;