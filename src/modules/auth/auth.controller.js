// src/modules/auth/auth.controller.js
import asyncHandler from "../../utils/asyncHandler.js";
import {
	findUserByEmail,
	createUser,
	verifyPassword,
	issueJwtForUser,
} from "./auth.service.js";

/** ---------- SIGNUP ---------- */
export const signupController = asyncHandler(async (req, res) => {
	const { email, name, password } = req.body || {};

	if (!email || !password) {
		return res
			.status(400)
			.json({ success: false, error: "email and password required" });
	}

	const exists = await findUserByEmail(email);
	if (exists) {
		return res
			.status(409)
			.json({ success: false, error: "email already registered" });
	}

	const user = await createUser({ email, name, password });
	const token = issueJwtForUser(user.id);

	return res.status(201).json({
		success: true,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			isVerified: user.isVerified, // <-- added
		},
		token,
	});
});

/** ---------- LOGIN ---------- */
export const loginController = asyncHandler(async (req, res) => {
	const { email, password } = req.body || {};

	if (!email || !password) {
		return res
			.status(400)
			.json({ success: false, error: "email and password required" });
	}

	const user = await findUserByEmail(email);
	if (!user) {
		return res
			.status(401)
			.json({ success: false, error: "invalid credentials" });
	}

	const ok = await verifyPassword(password, user.password);
	if (!ok) {
		return res
			.status(401)
			.json({ success: false, error: "invalid credentials" });
	}

	const token = issueJwtForUser(user.id);

	return res.json({
		success: true,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			isVerified: user.isVerified, // <-- added
		},
		token,
	});
});

/** ---------- GOOGLE CALLBACK ---------- */
export const googleCallbackController = asyncHandler(async (req, res) => {
	const token = issueJwtForUser(req.user.id);

	return res.json({
		success: true,
		message: "Google OAuth successful",
		user: {
			id: req.user.id,
			email: req.user.email,
			name: req.user.name,
			avatar: req.user.avatar,
			isVerified: req.user.isVerified, // already present
		},
		token,
	});
});

/** ---------- GOOGLE AUTH URL ---------- */
export const googleAuthUrlController = asyncHandler(async (_req, res) => {
	const url =
		`https://accounts.google.com/o/oauth2/v2/auth?` +
		`client_id=${process.env.GOOGLE_CLIENT_ID}&` +
		`redirect_uri=${encodeURIComponent(
			"http://localhost:3000/api/v1/auth/google/callback"
		)}&` +
		`response_type=code&scope=profile%20email&access_type=offline&prompt=consent`;

	res.json({ success: true, url });
});
