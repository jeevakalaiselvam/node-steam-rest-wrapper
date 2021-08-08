const fs = require("fs");
const path = require("path");
const {
  getGamesSortedByCompletionPercentage,
  getGamesSortedByPlaytime,
  getGamesSortedByNameAZ,
  getGamesSortedByNameZA,
  getAllRecentlyUnlockedAchievements,
  getNAchievementImages,
} = require("../helper/achivementHelper");
const {
  paginateGames,
  getAllPerfectGames,
  getNRandomGameImages,
  getNPerfectGameImages,
} = require("../helper/gamesHelper");
const { writeLog } = require("../utils/fileUtils");

const ADD_TEST_DELAY = true;

exports.sendResponse = (res, data) => {
  if (ADD_TEST_DELAY) {
    setTimeout(() => {
      res.json(data);
    }, 200);
  } else {
    res.json(data);
  }
};

exports.apiRootEndpoint = (req, res, next) => {
  res.json({
    status: "success",
    data: "API ENDPOINT",
  });
};

exports.getDatabase = (req, res) => {
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const database = JSON.parse(data);
      res.json(database);
    }
  );
};

exports.getAllGames = (req, res) => {
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "";
  const page = req.query.page ?? "0";

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const dbGames = JSON.parse(data).games;

      let games = [];
      dbGames.map((dbGame) => {
        let game = {};
        game.name = dbGame.name;
        game.id = dbGame.id;
        game.image = dbGame.image;
        game.playtime_minutes = dbGame.playtime_minutes;
        game.total_achievements_count = dbGame.total_achievements_count;
        game.completed_achievements_count = dbGame.completed_achievements_count;
        game.completion_percentage = dbGame.completion_percentage;

        games.push(game);
      });

      console.log(sort);

      let sortedGames = [];
      if (sort === "completion")
        sortedGames = getGamesSortedByCompletionPercentage(games);
      if (sort === "playtime") sortedGames = getGamesSortedByPlaytime(games);
      if (sort === "name" && order === "az")
        sortedGames = getGamesSortedByNameAZ(games);
      if (sort === "name" && order === "za")
        sortedGames = getGamesSortedByNameZA(games);

      const paginatedGames = paginateGames(sortedGames, page);

      this.sendResponse(res, paginatedGames);
    }
  );
};

exports.getAllGamesInfo = (req, res) => {
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const dbGames = JSON.parse(data).games;

      let gameInfo = {};
      let totalGames = 0;
      let totalStartedGames = 0;
      let totalPercentage = 0;
      let completedAchievements = 0;
      let perfectGames = 0;

      dbGames.map((game) => {
        totalGames += 1;
        if (+game.completion_percentage !== 0) {
          totalPercentage += (+game.completion_percentage / 80) * 100;
          totalStartedGames += 1;
        }
        completedAchievements += game.completed_achievements_count;
        if (game.completion_percentage >= 80) {
          perfectGames += 1;
        }
      });

      gameInfo.total_games = totalGames;
      gameInfo.average_completion = totalPercentage / totalStartedGames;
      gameInfo.completed_achievements = completedAchievements;
      gameInfo.perfect_games_count = perfectGames;

      this.sendResponse(res, gameInfo);
    }
  );
};

exports.getImagesForOverlay = (req, res) => {
  const gamesCount = req.query.games ?? 1;
  const achievementCount = req.query.achievements ?? 1;
  const perfectGamesCount = req.query.perfectgames ?? 1;

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const allGames = JSON.parse(data).games;
      const perfectGames = getAllPerfectGames(allGames);
      const allRecentlyUnlockedAchievements = getAllRecentlyUnlockedAchievements(
        allGames
      );
      writeLog(allGames, "allGames.json");
      writeLog(perfectGames, "perfectGames.json");
      writeLog(
        allRecentlyUnlockedAchievements,
        "allRecentlyUnlockedAchievements.json"
      );

      const randomNGamesImages = getNRandomGameImages(allGames, gamesCount);
      const randomNAchievementImages = getNAchievementImages(
        allRecentlyUnlockedAchievements,
        achievementCount
      );
      const randomNPerfectGameImages = getNPerfectGameImages(
        perfectGames,
        perfectGamesCount
      );

      this.sendResponse(res, {
        game_images: randomNGamesImages,
        achievement_images: randomNAchievementImages,
        perfect_game_images: randomNPerfectGameImages,
      });
    }
  );
};
