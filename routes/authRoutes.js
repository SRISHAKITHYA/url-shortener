const express = require("express");
const {
  googleLogin,
  googleCallback,
} = require("../controllers/authController");
const router = express.Router();

router.post("/google-login", googleLogin);
router.get("/google/callback", googleCallback);

module.exports = router;
