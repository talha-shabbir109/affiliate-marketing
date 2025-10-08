// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./database.js";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/api/v1/auth/google/callback",
		},
		async (_accessToken, _refreshToken, profile, done) => {
			try {
				const email = profile.emails?.[0]?.value || null;
				const gId = profile.id;

				if (!email) {
					return done(new Error("Google profile has no email"), null);
				}

				// 1) Try exact compound unique match (email + googleId)
				let user = await prisma.user.findUnique({
					where: { email_googleId: { email, googleId: gId } },
				});

				// 2) If not found, try by email only (user may exist from email/password signup)
				if (!user) {
					const byEmail = await prisma.user.findUnique({ where: { email } });

					if (byEmail) {
						// Link Google account to existing user
						user = await prisma.user.update({
							where: { email },
							data: {
								googleId: gId,
								avatar: profile.photos?.[0]?.value || null,
								isVerified: true,
							},
						});
					} else {
						// 3) Create a new user with both email + googleId
						user = await prisma.user.create({
							data: {
								email,
								googleId: gId,
								name: profile.displayName || "",
								avatar: profile.photos?.[0]?.value || null,
								isVerified: true,
							},
						});
					}
				}

				return done(null, user);
			} catch (err) {
				console.error("Google OAuth Error:", err);
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (e) {
		done(e, null);
	}
});

export default passport;
