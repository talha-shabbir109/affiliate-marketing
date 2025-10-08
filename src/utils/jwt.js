// src/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Create/sign a JWT
export function signJwt(payload, options = { expiresIn: "7d" }) {
	return jwt.sign(payload, JWT_SECRET, options);
}

// Verify/Decode a JWT (will throw if invalid/expired)
export function verifyJwt(token) {
	return jwt.verify(token, JWT_SECRET);
}

// (Optional) Safe decode without throwing (returns null if invalid)
export function tryDecode(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch {
		return null;
	}
}
