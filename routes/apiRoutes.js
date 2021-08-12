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
router.get("/game/info", apiController.getGameInfo);
router.get("/games", apiController.getAllGames);
router.get("/achievements/history", apiController.getAllAchievementsForAYear);
router.get("/achievements/game", apiController.getAllAchievementsForGame);
router.get(
  "/achievements/hidden",
  apiController.getHiddenAchievementsForGameByID
);
router.get(
  "/achievements/milestones",
  apiController.getAllMilestoneAchievements
);
router.get("/achievements", apiController.getAllAchievements);

router.get("/backlog", apiController.getAllAchievementsBacklog);
router.get("/next", apiController.getAllAchievementsNext);

router.get("/refresh", apiController.refreshDatabase);

//Send response for root API
router.get("/", apiController.apiRootEndpoint);

module.exports = router;
