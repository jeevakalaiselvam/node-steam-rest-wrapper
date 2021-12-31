const axios = require("axios");
const htmlparser2 = require("htmlparser2");
const cheerio = require("cheerio");
const fs = require("fs");
var DomParser = require("dom-parser");
var parser = new DomParser();

const {
  STEAM_ALL_GAMES_URL,
  STEAM_ALL_ACHIEVEMENTS_SCHEMA,
  STEAM_ALL_ACHIEVEMENTS_PLAYER,
  STEAM_ALL_ACHIEVEMENTS_GLOBAL,
} = require("../config/steamConfig");
const { writeLog } = require("../utils/fileUtils");

exports.getAllGamesFromSteam = async () => {
  try {
    const ownedGamesResponse = await axios.get(STEAM_ALL_GAMES_URL);
    const allGamesOld = ownedGamesResponse.data;
    const allGames = {};
    allGames.total_count = allGamesOld.response.game_count;
    allGames.games = allGamesOld.response.games;
    return allGames;
  } catch (error) {
    return {
      status: "fail",
      point: "[ACTIONS]",
      message: "Something went wrong while getting games from Steam",
      error: error.message,
    };
  }
};

exports.getAllSchemaAchievements = async (gameID) => {
  try {
    const achievements = await axios.get(STEAM_ALL_ACHIEVEMENTS_SCHEMA(gameID));
    return achievements.data.game.availableGameStats.achievements;
  } catch (error) {
    return {
      status: "fail",
      point: "[ACTIONS]",
      message:
        "Something went wrong while getting Schema Achievements from Steam",
      error: error.message,
    };
  }
};

exports.getAllPlayerAchievements = async (gameID) => {
  try {
    const playerAchievements = await axios.get(
      STEAM_ALL_ACHIEVEMENTS_PLAYER(gameID)
    );
    return playerAchievements.data.playerstats.achievements;
  } catch (error) {
    return {
      status: "fail",
      point: "[ACTIONS]",
      message:
        "Something went wrong while getting Player Achievements from Steam",
      error: error.message,
    };
  }
};

exports.getAllGlobalAchievements = async (gameID) => {
  try {
    const globalAchievements = await axios.get(
      STEAM_ALL_ACHIEVEMENTS_GLOBAL(gameID)
    );
    return globalAchievements.data.achievementpercentages.achievements;
  } catch (error) {
    return {
      status: "fail",
      point: "[ACTIONS]",
      message:
        "Something went wrong while getting Global Achievements from Steam",
      error: error.message,
    };
  }
};
