const axios = require("axios");
const htmlparser2 = require("htmlparser2");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
var DomParser = require("dom-parser");
var parser = new DomParser();

const {
  STEAM_ALL_GAMES_URL,
  STEAM_ALL_ACHIEVEMENTS_SCHEMA,
} = require("../config/steamConfig");
const { writeLog } = require("../utils/fileUtils");

exports.getAllGamesFromSteam = async () => {
  console.clear();
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
  console.clear();
  try {
    const schemaAchievements = await axios.get(
      STEAM_ALL_ACHIEVEMENTS_SCHEMA(gameID)
    );
    return schemaAchievements.data;
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
  console.clear();
  try {
    const schemaAchievements = await axios.get(
      STEAM_ALL_ACHIEVEMENTS_SCHEMA(gameID)
    );
    return schemaAchievements.data;
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
  console.clear();
  try {
    const schemaAchievements = await axios.get(
      STEAM_ALL_ACHIEVEMENTS_SCHEMA(gameID)
    );
    return schemaAchievements.data;
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
