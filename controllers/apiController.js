const fs = require("fs");
const path = require("path");
const {
  getGamesSortedByCompletionPercentage,
} = require("../helper/achivementHelper");

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
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const dbGames = JSON.parse(data);

      let games = [];
      dbGames.games.map((dbGame) => {
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

      const sortedByCompletionGames =
        getGamesSortedByCompletionPercentage(games);

      setTimeout(() => {
        res.json(sortedByCompletionGames);
      }, 500);
    }
  );
};
