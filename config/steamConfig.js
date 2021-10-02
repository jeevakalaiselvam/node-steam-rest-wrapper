const dotenv = require("dotenv");
dotenv.config();

exports.STEAM_ALL_GAMES_URL = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_USER_ID}&format={{RES_FORMAT}}&include_appinfo=true`;

exports.STEAM_ALL_ACHIEVEMENTS_SCHEMA = (gameID) =>
  `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${process.env.STEAM_API_KEY}&appid=${gameID}&format=json&l=english`;

exports.STEAM_ALL_ACHIEVEMENTS_GLOBAL = (gameID) =>
  `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameID}&format=json`;

exports.STEAM_ALL_ACHIEVEMENTS_PLAYER = (gameID) =>
  `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameID}&key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_USER_ID}`;

exports.STEAM_GAME_HEADER_IMAGE = (gameID) =>
  `http://cdn.cloudflare.steamstatic.com/steam/apps/${gameID}/header.jpg`;
