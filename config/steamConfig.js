const dotenv = require("dotenv");
dotenv.config();

exports.STEAM_ALL_GAMES_URL = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_USER_ID}&format={{RES_FORMAT}}&include_appinfo=true`;

exports.STEAM_ALL_ACHIEVEMENTS_SCHEMA = (gameID) =>
  `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${process.env.STEAM_API_KEY}&appid=${gameID}&format=json&l=english`;

exports.STEAM_ALL_ACHIEVEMENTS_GLOBAL = (gameID) =>
  `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameID}&format=json`;

exports.STEAM_ALL_ACHIEVEMENTS_PLAYER = (gameID) =>
  `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameID}&key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_USER_ID}`;
