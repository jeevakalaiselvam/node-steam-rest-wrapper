const {
  getAllGamesFromSteam,
  getAllSchemaAchievements,
  getAllGlobalAchievements,
  getAllPlayerAchievements,
} = require("../actions/crawlActions");

const {
  STEAM_ALL_GAMES_URL,
  STEAM_GAME_HEADER_IMAGE,
} = require("../config/steamConfig");
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

  const newFormatGames = {};
  newFormatGames.games = allGames.games.map((game) => {
    const newGame = {};
    newGame.name = game.name;
    newGame.game_id = game.appid;
    newGame.header_image = STEAM_GAME_HEADER_IMAGE(game.game_id);
    newGame.playtime_minutes = game.playtime_forever;
    console.log(newGame);
    return newGame;
  });

  const schemaAddedGames = await Promise.all(
    newFormatGames.games.map(async (game) => {
      const schemaAchievements = await getAllSchemaAchievements(game.game_id);
      game.schemaAchievements = schemaAchievements;
      return game;
    })
  );

  const globalAddedGames = await Promise.all(
    schemaAddedGames.map(async (game) => {
      const globalAchievements = await getAllGlobalAchievements(game.game_id);
      game.globalAchievements = globalAchievements;
      return game;
    })
  );

  const playerAddedGames = await Promise.all(
    globalAddedGames.map(async (game) => {
      const playerAchievements = await getAllPlayerAchievements(game.game_id);
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
