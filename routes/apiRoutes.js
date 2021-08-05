const express = require("express");
const apiController = require("../controllers/apiController");

const router = express.Router();

// if (process.env.TESTING_CACHE === true) {
//   router.get("/games", apiController.sendTestResponse);
// } else {
//   router.get("/games", apiController.allOwnedGames);
// }
router.get("/games", apiController.sendTestResponse);
// router.get("/games", apiController.allOwnedGames);

router.get("/", apiController.apiRootEndpoint);

module.exports = router;
