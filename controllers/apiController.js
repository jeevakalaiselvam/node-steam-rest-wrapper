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

  let newFormatGames = {};
  newFormatGames.total_games = allGames.total_count;

  newFormatGames.games = allGames.games.map((game) => {
    const newGame = {};
    newGame.name = game.name;
    newGame.game_id = game.appid;
    newGame.header_image = STEAM_GAME_HEADER_IMAGE(game.appid);
    newGame.playtime_minutes = game.playtime_forever;
    console.log(newGame);
    return newGame;
  });

  newFormatGames = await Promise.all(
    newFormatGames.games.map(async (game) => {
      const schemaAchievements = await getAllSchemaAchievements(game.game_id);
      game.schema_achievements = schemaAchievements;
      return game;
    })
  );

  newFormatGames = await Promise.all(
    newFormatGames.map(async (game) => {
      const globalAchievements = await getAllGlobalAchievements(game.game_id);
      game.global_achievements = globalAchievements;
      return game;
    })
  );

  newFormatGames = await Promise.all(
    newFormatGames.map(async (game) => {
      const playerAchievements = await getAllPlayerAchievements(game.game_id);
      game.player_achievements = playerAchievements;
      return game;
    })
  );

  //If games data is present
  newFormatGames &&
    res.json({
      status: "success",
      games: newFormatGames,
    });

  //If unable to get games
  !newFormatGames &&
    res.json({
      status: "fail",
      file: "[CONTROLLER]",
      message: "No games complete response obtained!",
    });
};
