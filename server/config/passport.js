const passport = require('passport');
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            user.isEmailVerified = true;
            await user.save();
            return done(null, user);
          }

          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            role: 'client',
            isEmailVerified: true,
          });

          // Create a ClientProfile for the new user
          const ClientProfile = require('../models/ClientProfile');
          await ClientProfile.create({ user: newUser._id });

          return done(null, newUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID missing). OAuth login will be disabled.');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
