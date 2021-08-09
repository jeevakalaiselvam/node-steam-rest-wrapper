const fs = require("fs");
const path = require("path");
const {
  getAllRecentlyUnlockedAchievements,
  getNAchievementImages,
  getAchievementsSortedByRecent,
  paginateAchievements,
  getAchievementsSortedByRarity,
  getAchievementsSortedByGames,
  getAchievementsSortedByNameAZ,
  getAchievementsSortedByNameZA,
} = require("../helper/achivementHelper");
const {
  getGamesSortedByCompletionPercentage,
  getGamesSortedByPlaytime,
  getGamesSortedByNameAZ,
  getGamesSortedByNameZA,
  paginateGames,
  getAllPerfectGames,
  getNGameImages,
  getNPerfectGameImages,
  checkSelectionCriteriaFulfilled,
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
  const select = req.query.select ?? "";
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "";
  const page = req.query.page ?? "0";
  console.log("QUERY -> ", select, sort, order, page);

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
      dbGames.forEach((dbGame) => {
        if (checkSelectionCriteriaFulfilled(dbGame, select)) {
          let game = {};
          game.name = dbGame.name;
          game.id = dbGame.id;
          game.image = dbGame.image;
          game.playtime_minutes = dbGame.playtime_minutes;
          game.total_achievements_count = dbGame.total_achievements_count;
          game.completed_achievements_count =
            dbGame.completed_achievements_count;
          game.completion_percentage = dbGame.completion_percentage;
          console.log("Adding -> ", game.name);
          games.push(game);
        } else {
          console.log("NOPE");
        }
      });

      console.log("QUERY -> ", select, sort, order, page);

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

      const gameImages = getNGameImages(allGames, gamesCount);
      const achievmentImages = getNAchievementImages(
        allRecentlyUnlockedAchievements,
        achievementCount
      );
      const perfectImages = getNPerfectGameImages(
        perfectGames,
        perfectGamesCount
      );

      this.sendResponse(res, {
        game_images: gameImages,
        achievement_images: achievmentImages,
        perfect_game_images: perfectImages,
      });
    }
  );
};

exports.getAllAchievements = (req, res) => {
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

      let achievements = [];
      dbGames.map((dbGame) => {
        dbGame.all_achievements.forEach((achievement) => {
          if (achievement.unlocked === 1) {
            achievements.push(achievement);
          }
        });
      });

      let sortedAchievements = [];
      if (sort === "recent")
        sortedAchievements = getAchievementsSortedByRecent(achievements);
      if (sort === "rarity")
        sortedAchievements = getAchievementsSortedByRarity(achievements);
      if (sort === "games")
        sortedAchievements = getAchievementsSortedByGames(achievements);
      if (sort === "name" && order === "az")
        sortedAchievements = getAchievementsSortedByNameAZ(achievements);
      if (sort === "name" && order === "za")
        sortedAchievements = getAchievementsSortedByNameZA(achievements);

      const paginatedAchievements = paginateAchievements(
        sortedAchievements,
        page
      );

      this.sendResponse(res, paginatedAchievements);
    }
  );
};
