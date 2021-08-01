const {
  getAllGamesFromSteam,
  getAllSchemaAchievements,
  getAllGlobalAchievements,
  getAllPlayerAchievements,
} = require("../actions/crawlActions");
const { writeLog } = require("../utils/fileUtils");

exports.apiRootEndpoint = (req, res, next) => {
  res.json({
    status: "success",
    data: "API ENDPOINT",
  });
};

//Get all games
exports.allOwnedGames = async (req, res, next) => {
  const allGames = await getAllGamesFromSteam();

  const schemaAddedGames = await Promise.all(
    allGames.games.map(async (game) => {
      const schemaAchievements = await getAllSchemaAchievements(game.appid);
      game.schemaAchievements = schemaAchievements;
      return game;
    })
  );

  const globalAddedGames = await Promise.all(
    schemaAddedGames.map(async (game) => {
      const globalAchievements = await getAllGlobalAchievements(game.appid);
      game.globalAchievements = globalAchievements;
      return game;
    })
  );

  const playerAddedGames = await Promise.all(
    globalAddedGames.map(async (game) => {
      const playerAchievements = await getAllPlayerAchievements(game.appid);
      game.playerAchievements = playerAchievements;
      return game;
    })
  );

  //If games data is present
  playerAddedGames &&
    res.json({
      status: "success",
      games: playerAddedGames,
    });

  //If unable to get games
  !playerAddedGames &&
    res.json({
      status: "fail",
      file: "[CONTROLLER]",
      message: "No games complete response obtained!",
    });
};
