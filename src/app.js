// src/app.js
import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());

// keep session for Google OAuth; (we can remove later if fully JWT-only)
app.use(
	session({
		secret: process.env.JWT_SECRET || "dev-secret",
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

// feature routes
app.use("/api/v1/auth", authRouter);

export default app;
