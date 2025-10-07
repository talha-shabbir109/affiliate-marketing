// server.js (clean & minimal)
import "dotenv/config";
import express from "express";
import { connectDB, prisma } from "./src/config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "./src/config/passport.js";
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// connect DB
await connectDB();

app.use(express.json());
app.use(
	session({
		secret: process.env.JWT_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

// health
app.get("/", (_req, res) => {
	res.json({ ok: true, service: "affiliate-marketing-api" });
});

// POST /signup - FIXED VERSION
app.post("/signup", async (req, res) => {
	try {
		const { email, name, password } = req.body || {};
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, error: "email and password required" });
		}

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists)
			return res
				.status(409)
				.json({ success: false, error: "email already registered" });

		const hashed = await bcrypt.hash(password, 10);

		// FIX: Explicitly set googleId to undefined to avoid null unique constraint
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashed,
				googleId: undefined, // This prevents null unique constraint violation
				isVerified: false,
				verificationToken: null,
			},
		});

		const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

		res.status(201).json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				isVerified: user.isVerified,
			},
			token,
		});
	} catch (err) {
		console.error("Signup Error:", err);
		res.status(500).json({ success: false, error: String(err.message || err) });
	}
});

// POST /login
app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, error: "email and password required" });
		}

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user)
			return res
				.status(401)
				.json({ success: false, error: "invalid credentials" });

		// Check if user has password (Google OAuth users don't have passwords)
		if (!user.password) {
			return res.status(401).json({
				success: false,
				error:
					"This email is registered with Google OAuth. Please use Google Sign In.",
			});
		}

		const ok = await bcrypt.compare(password, user.password);
		if (!ok)
			return res
				.status(401)
				.json({ success: false, error: "invalid credentials" });

		const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

		res.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			token,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: String(err.message || err) });
	}
});

// Google OAuth Routes
app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
	}),
	async (req, res) => {
		try {
			// Generate JWT token for the user
			const token = jwt.sign({ sub: req.user.id }, JWT_SECRET, {
				expiresIn: "7d",
			});

			// For testing - show token in response
			res.json({
				success: true,
				message: "Google OAuth successful",
				user: {
					id: req.user.id,
					email: req.user.email,
					name: req.user.name,
					avatar: req.user.avatar,
				},
				token,
			});
		} catch (error) {
			res.status(500).json({ success: false, error: "Authentication failed" });
		}
	}
);

// Get Google Auth URL (for frontend)
app.get("/auth/google/url", (req, res) => {
	const authUrl =
		`https://accounts.google.com/o/oauth2/v2/auth?` +
		`client_id=${process.env.GOOGLE_CLIENT_ID}&` +
		`redirect_uri=${encodeURIComponent(
			"http://localhost:3000/auth/google/callback"
		)}&` +
		`response_type=code&` +
		`scope=profile email&` +
		`access_type=offline&` +
		`prompt=consent`;

	res.json({ success: true, url: authUrl });
});

app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
