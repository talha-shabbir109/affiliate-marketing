const express = require("express");
const { connectDB } = require("./src/config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "Affiliate Marketing API - Signup Feature Branch",
		branch: "2-featuresignup-email-password",
		database: "Connected via Prisma",
	});
});

// Server start
app.listen(PORT, () => {
	console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
