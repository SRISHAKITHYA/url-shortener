const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const { email, displayName: name, id: googleId } = profile;

        let user = await db.query("SELECT * FROM users WHERE google_id = $1", [
          googleId,
        ]);

        if (user.rows.length === 0) {
          user = await db.query(
            "INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *",
            [email, name, googleId]
          );
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);

exports.googleLogin = passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login"],
});

exports.googleCallback = passport.authenticate(
  "google",
  { failureRedirect: "/" },
  function (req, res) {
    const jwtToken = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  }
);
