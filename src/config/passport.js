import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./database.js";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				console.log("Google Profile:", profile);

				// Check if user already exists with Google ID
				let user = await prisma.user.findUnique({
					where: { googleId: profile.id },
				});

				if (user) {
					return done(null, user);
				}

				// Check if user exists with email
				user = await prisma.user.findUnique({
					where: { email: profile.emails[0].value },
				});

				if (user) {
					// Update existing user with Google ID
					user = await prisma.user.update({
						where: { email: profile.emails[0].value },
						data: {
							googleId: profile.id,
							avatar: profile.photos[0].value,
						},
					});
				} else {
					// Create new user
					user = await prisma.user.create({
						data: {
							googleId: profile.id,
							email: profile.emails[0].value,
							name: profile.displayName,
							avatar: profile.photos[0].value,
							isVerified: true, // Google already verified the email
						},
					});
				}

				return done(null, user);
			} catch (error) {
				console.error("Google OAuth Error:", error);
				return done(error, null);
			}
		}
	)
);

// For session support
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

export default passport;
