import express from "express";
import passport from "./passport-config.js";
import User from "./schemas/User.js";
import logger from "./logger-backend.js";

const authRoutes = express.Router();

authRoutes.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    // Guard clause: Already has an account
    if (existingUser)
      return res.status(400).json({ message: "Email already in use." });

    const user = new User({ email, password });
    await user.save();
    res.status(201).send("User registered");
  } catch (err) {
    logger.error(`Error in request /register:\n${err}`);
    res.status(500).send("Error registering user");
  }
});

authRoutes.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/auth/login-fail" }),
  async (req, res) => {
    try {
      if (req.user) {
        const projection = { _id: 1, siteName: 1 };
        const user = await User.findById(req.user._id, projection)
          .populate("sites", projection)
          .exec();

        return res.json({ message: "Logged in successfully", user });
      }

      res.status(401).json({ message: "Invalid credentials" });
    } catch (err) {
      logger.error(`Error in request /login:\n${err}`);
      res.status(500).json({ error: "An error occurred, please try again." });
    }
  },
);

authRoutes.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((sessionErr) => {
      if (sessionErr) return next(sessionErr);
      res.clearCookie("connect.sid");
      res.send("Logged out");
    });
  });
});

export default authRoutes;
