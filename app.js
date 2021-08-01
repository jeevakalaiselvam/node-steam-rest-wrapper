const express = require("express");
const dotenv = require("dotenv");
const app = express();
const apiRouter = require("./routes/apiRoutes.js");
console.clear();

//Load in config
dotenv.config();

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

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Listening on port ${PORT} 👋`));
