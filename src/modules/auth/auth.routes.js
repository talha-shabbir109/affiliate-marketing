// src/modules/auth/auth.routes.js
import { Router } from "express";
import passport from "../../config/passport.js";
import {
	signupController,
	loginController,
	googleCallbackController,
	googleAuthUrlController,
} from "./auth.controller.js";

const router = Router();

// Email + Password
router.post("/signup", signupController);
router.post("/login", loginController);

// Google OAuth
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
	}),
	googleCallbackController
);

// Helper route for frontend (returns the Google Auth URL)
router.get("/google/url", googleAuthUrlController);

export default router;
