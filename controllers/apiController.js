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

  const transformedGames = mergeFilterAndCalculate(newFormatGames);

  //If games data is present
  transformedGames &&
    res.json({
      status: "success",
      games: transformedGames,
    });

  //If unable to get games
  !transformedGames &&
    res.json({
      status: "fail",
      file: "[CONTROLLER]",
      message: "No games complete response obtained!",
    });
};

//Merge all achievement data present in response from backend API and put them into a single achivements array in each game object
const mergeFilterAndCalculate = (games) => {
  const achievementOnlyGames = filterAchievementOnlyGames(games);
  const addTotalAchievementsGames =
    addTotalAchievementsForEachGame(achievementOnlyGames);

  return addTotalAchievementsGames;
};

//Filter and return only games having achivements
const filterAchievementOnlyGames = (games) => {
  const achievementOnlyFilteredGames = games.filter((game) => {
    if (game.schema_achievements) {
      if (game.schema_achievements.length > 0) {
        return true;
      }
    }
    return false;
  });

  return achievementOnlyFilteredGames;
};

//For each game, Check the total achivements in schema_achievements and add a new field total_achievements for each game
const addTotalAchievementsForEachGame = (games) => {
  const totalAchievementsAddedGames = games.map((game) => {
    const totalAchievementAddedGame = {
      ...game,
      total_achievements: game.schema_achievements.length,
    };
    return totalAchievementAddedGame;
  });
  return totalAchievementsAddedGames;
};
