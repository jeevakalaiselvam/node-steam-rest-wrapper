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
router.get("/achievements/game", apiController.getAllAchievementsForGame);
router.get(
  "/achievements/hidden",
  apiController.getHiddenAchievementsForGameByID
);
router.get("/achievements", apiController.getAllAchievements);

//Send response for root API
router.get("/", apiController.apiRootEndpoint);

module.exports = router;
