const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const app = express();
const apiRouter = require("./routes/apiRoutes.js");
const {
  allOwnedGames,
  getHiddenAchievementDataAndStore,
  refreshDatabaseAndStore,
} = require("./controllers/cacheController.js");
const { log } = require("console");
const { LOG } = require("./helper/logger.js");
console.clear();

//Load in config
dotenv.config();

//Middleware Stack
app.use(compression());
app.enable("trust proxy");
app.options("*", cors());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Rate Limit
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//Cookie Parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

//Prevention
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//All Routes
//Handle all API Routes
app.use("/api", apiRouter);

//Generic Route - To be handled at last
app.get("/", (req, res) =>
  res.json({
    status: "success",
    data: "HOMEPAGE - TO BE BUILT",
  })
);

app.get("*", (req, res) => {
  res.json({
    status: "fail",
    data: "PAGE NOT FOUND - 404",
  });
});

setInterval(() => {
  LOG("CACHING DATA - CURRENT TIME -> ", new Date().toISOString());
  LOG("Getting data from Steam and storing..");
  refreshDatabaseAndStore();
}, 1000 * 60 * 60);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => LOG(`Listening on port ${PORT} 👋`));
