const fs = require("fs");
const path = require("path");
const {
  getGamesSortedByCompletionPercentage,
  getGamesSortedByPlaytime,
  getGamesSortedByNameAZ,
  getGamesSortedByNameZA,
} = require("../helper/achivementHelper");

const ADD_TEST_DELAY = true;

exports.sendResponse = (res, data) => {
  if (ADD_TEST_DELAY) {
    setTimeout(() => {
      res.json(data);
    }, 1000);
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

      let sortedByCompletionGames = [];
      if (sort === "completion")
        sortedByCompletionGames = getGamesSortedByCompletionPercentage(games);
      if (sort === "playtime")
        sortedByCompletionGames = getGamesSortedByPlaytime(games);
      if (sort === "name" && order === "az")
        sortedByCompletionGames = getGamesSortedByNameAZ(games);
      if (sort === "name" && order === "za")
        sortedByCompletionGames = getGamesSortedByNameZA(games);

      this.sendResponse(res, sortedByCompletionGames);
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
