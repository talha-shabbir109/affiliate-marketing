// server.js (clean & minimal)
import "dotenv/config";
import express from "express";
import { connectDB, prisma } from "./src/config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// connect DB
await connectDB();

app.use(express.json());

// health
app.get("/", (_req, res) => {
	res.json({ ok: true, service: "affiliate-marketing-api" });
});

// POST /signup
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
		const user = await prisma.user.create({
			data: { email, name, password: hashed },
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
			},
			token,
		});
	} catch (err) {
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

		const ok = await bcrypt.compare(password, user.password || "");
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

app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
