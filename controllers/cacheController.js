const {
  getAllGamesFromSteam,
  getAllSchemaAchievements,
  getAllGlobalAchievements,
  getAllPlayerAchievements,
} = require("../actions/crawlActions");
const axios = require("axios");
const cheerio = require("cheerio");
const htmlparser2 = require("htmlparser2");

const {
  STEAM_ALL_GAMES_URL,
  STEAM_GAME_HEADER_IMAGE,
} = require("../config/steamConfig");
const { writeLog, writeHiddenData } = require("../utils/fileUtils");
const fs = require("fs");
const path = require("path");
const { nameAZComparatorGame } = require("../helper/comparator");
const { LOG } = require("../helper/logger");
const { getAllGames } = require("./apiController");

exports.sendTestResponse = async (req, res, next) => {
  fs.readFile(
    path.join(__dirname, "../", "log", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const status = JSON.parse(data);
      const games = status.games;

      res.json(status);
    }
  );
};

//Get all games
exports.refreshDatabaseAndStore = async (next, gameSync = true) => {
  try {
    LOG("REFRESHING DATABASE");
    const allGames = await getAllGamesFromSteam();

    let newFormatGames = {};
    newFormatGames.total_games = allGames.total_count;

    //USE SPLICE HERE WHEN TESTING

    newFormatGames.games = allGames.games.map((game, index) => {
      const newGame = {};
      newGame.name = game.name;
      newGame.game_id = game.appid;
      newGame.header_image = STEAM_GAME_HEADER_IMAGE(game.appid);
      newGame.playtime_minutes = game.playtime_forever;

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

    LOG("MERGING ALL INFORMATION FOR DATABASE");
    const transformedGames = mergeFilterAndCalculate(newFormatGames);

    const currentdate = new Date();
    const datetime =
      "Last Sync: " +
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    const responseToCache = {
      games: transformedGames,
      timestamp: datetime,
    };

    LOG("WRITING GATHERED INFO INTO DATABASE");
    await fs.writeFile(
      path.join(__dirname, "../", "store", "games.json"),
      JSON.stringify(responseToCache),
      (error) => {
        LOG("WRITING AND SYNCING INTO DATABASE SUCCESSS");
        if (gameSync) {
          next();
        }
      }
    );
    //this.getHiddenAchievementsForGame();
    //file written successfully
  } catch (err) {
    console.error(err);
  }
};

//Merge all achievement data present in response from backend API and put them into a single achivements array in each game object
const mergeFilterAndCalculate = (newFormatGames) => {
  const achievementOnlyGames = filterAchievementOnlyGames(newFormatGames);
  const achievementsMergesGames = mergeAchievements(achievementOnlyGames);

  return achievementsMergesGames;
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
const mergeAchievements = (games) => {
  let achievementsMergedGames = [];

  achievementsMergedGames = games.map((game, index) => {
    const newGame = {};
    newGame.name = game.name;
    newGame.id = game.game_id;
    newGame.image = game.header_image;
    newGame.playtime_minutes = game.playtime_minutes;

    //Add fields from player_achievements and global_achievements into all_achievements
    newGame.all_achievements = game.schema_achievements.map(
      (achievementSchema) => {
        const newAchievement = {};
        newAchievement.id = achievementSchema.name;
        newAchievement.game_id = game.game_id;
        newAchievement.game_name = game.name;
        newAchievement.name = achievementSchema.displayName;
        newAchievement.hidden = achievementSchema.hidden;
        newAchievement.icon = achievementSchema.icon;
        newAchievement.description =
          achievementSchema.description || "Hidden Achievement";
        newAchievement.icon_locked = achievementSchema.icongray;
        const globalPercentageOfAchievement = game.global_achievements.find(
          (achievementGlobal) => {
            if (achievementSchema.name === achievementGlobal.name) {
              return true;
            }
          }
        );
        if (globalPercentageOfAchievement)
          newAchievement.global_percentage =
            globalPercentageOfAchievement.percent;
        else newAchievement.global_percentage = "0";

        const unlockedForAchievement = game.player_achievements.find(
          (achievementPlayer) => {
            if (achievementSchema.name === achievementPlayer.apiname) {
              return true;
            }
          }
        );
        if (unlockedForAchievement)
          newAchievement.unlocked = unlockedForAchievement.achieved;
        else newAchievement.unlocked = 0;

        const unlockedTimeForAchievement = game.player_achievements.find(
          (achievementPlayer) => {
            if (achievementSchema.name === achievementPlayer.apiname) {
              return true;
            }
          }
        );
        if (unlockedTimeForAchievement) {
          if (unlockedForAchievement.unlocktime !== 0) {
            newAchievement.unlocked_time =
              unlockedTimeForAchievement.unlocktime;
            newAchievement.unlocked_time_desc = formatDate(
              new Date(unlockedTimeForAchievement.unlocktime * 1000)
            );
          } else {
            newAchievement.unlocked_time = 0;
            unlocked_time_desc = 0;
          }
        }

        return newAchievement;
      }
    );

    newGame.total_achievements_count = game.schema_achievements.length;
    newGame.completed_achievements_count = newGame.all_achievements.reduce(
      (acc, achievement) => {
        if (achievement.unlocked === 1) {
          return acc + 1;
        }
        return acc + 0;
      },
      0
    );
    newGame.completion_percentage = (
      (newGame.completed_achievements_count /
        newGame.total_achievements_count) *
      100
    ).toFixed(4);

    return newGame;
  });

  return achievementsMergedGames;
};

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

exports.getHiddenAchievementsForGame = (gameId) => {
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("ERROR INSIDE WHEN CRAWLING HIDDEN INFORMATION");
        return;
      }
      const dbGames = JSON.parse(data).games;
      const hiddenAddedGames = dbGames.map(async (game) => {
        const url = `https://completionist.me/steam/app/${game.id}/achievements?display=mosaic&sort=created&order=desc`;
        await axios.get(url).then(
          (response) => {
            if (response.status === 200) {
              const html = response.data;
              const $ = cheerio.load(html);
              let titles = [];
              let descriptions = [];

              $("span.title").each(function(i, e) {
                titles[i] = $(this)
                  .text()
                  .trim();
              });
              $("span.description").each(function(i, e) {
                descriptions[i] = $(this)
                  .text()
                  .trim();
              });

              const hidden_achievements = [];
              titles.forEach((title, i) => {
                hidden_achievements.push({
                  name: titles[i],
                  description: descriptions[i],
                });
              });
              game.hidden_achievements = hidden_achievements;
            }
          },
          (error) => {}
        );
      });

      try {
        const data = fs.writeFileSync(
          path.join(__dirname, "../", "store", "games.json"),
          JSON.stringify(hiddenAddedGames)
        );

        //file written successfully
      } catch (err) {
        console.error(err);
      }
    }
  );
};

exports.getHiddenInfoByCrawling = async (gameId) => {
  const hiddenAchievements = [];

  const url = `https://completionist.me/steam/app/${gameId}/achievements?display=mosaic&sort=created&order=desc`;
  const hiddenResponse = await axios.get(url);
  const html = hiddenResponse.data;
  const $ = cheerio.load(html);
  let titles = [];
  let descriptions = [];

  $("span.title").each(function(i, e) {
    titles[i] = $(this)
      .text()
      .trim();
  });

  $("span.description").each(function(i, e) {
    descriptions[i] = $(this)
      .text()
      .trim();
  });

  titles.forEach((title, i) => {
    hiddenAchievements.push({
      name: titles[i],
      description: descriptions[i],
    });
  });

  return hiddenAchievements;
};
