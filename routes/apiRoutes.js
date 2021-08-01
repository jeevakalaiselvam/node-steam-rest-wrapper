const express = require("express");
const apiController = require("../controllers/apiController");

const router = express.Router();

router.get("/games", apiController.allOwnedGames);
router.get("/", apiController.apiRootEndpoint);

module.exports = router;
