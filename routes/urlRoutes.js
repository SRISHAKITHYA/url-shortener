const express = require("express");
const {
  shortenUrl,
  redirectUrl,
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} = require("../controllers/urlController");
const { authenticate } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/shorten", authenticate, shortenUrl);
router.get("/shorten/:alias", redirectUrl);
router.get("/analytics/:alias", authenticate, getUrlAnalytics);
router.get("/analytics/topic/:topic", authenticate, getTopicAnalytics);
router.get("/analytics/overall", authenticate, getOverallAnalytics);

module.exports = router;
