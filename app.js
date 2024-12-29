const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const rateLimiter = require("./middlewares/rateLimiter");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/auth", authRoutes);
app.use("/api", rateLimiter, urlRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
