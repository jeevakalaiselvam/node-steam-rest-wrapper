const express = require("express");
const apiController = require("../controllers/apiController");

const router = express.Router();

// if (process.env.TESTING_CACHE === true) {
//   router.get("/games", apiController.sendTestResponse);
// } else {
//   router.get("/games", apiController.allOwnedGames);
// }

router.get("/overlay", apiController.getImagesForOverlay);
router.get("/database", apiController.getDatabase);
router.get("/games/info", apiController.getAllGamesInfo);
router.get("/games", apiController.getAllGames);
router.get("/achievements", apiController.getAllAchievements);

//Send response for root API
router.get("/", apiController.apiRootEndpoint);

//Server loading games from every 30 mins.
setInterval(() => {
  console.log("Getting games from Steam");
}, 1000 * 60 * 30);

module.exports = router;
