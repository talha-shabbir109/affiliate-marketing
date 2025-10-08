// src/modules/auth/auth.service.js
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database.js";
import { signJwt } from "../../utils/jwt.js";

/** ---------- DATABASE FUNCTIONS ---------- */

// find a user by email
export async function findUserByEmail(email) {
	return prisma.user.findUnique({ where: { email } });
}

// find a user by ID
export async function findUserById(id) {
	return prisma.user.findUnique({ where: { id } });
}

// create a new user
export async function createUser({ email, name, password }) {
	const hashed = await bcrypt.hash(password, 10);
	return prisma.user.create({
		data: { email, name, password: hashed },
	});
}

/** ---------- AUTH HELPERS ---------- */

// verify plain password vs hashed password
export async function verifyPassword(plain, hashed) {
	return bcrypt.compare(plain, hashed || "");
}

// issue a JWT token for a user
export function issueJwtForUser(userId) {
	return signJwt({ sub: userId }, { expiresIn: "7d" });
}
