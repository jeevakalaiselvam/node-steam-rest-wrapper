const express = require("express");
const apiController = require("../controllers/apiController");

const router = express.Router();

// if (process.env.TESTING_CACHE === true) {
//   router.get("/games", apiController.sendTestResponse);
// } else {
//   router.get("/games", apiController.allOwnedGames);
// }

router.get("/games", apiController.getAllGames);

//Send response for root API
router.get("/", apiController.apiRootEndpoint);

//Server loading games from every 30 mins.
setInterval(() => {
  console.log("Getting games from Steam");
}, 1000 * 60 * 30);

module.exports = router;
