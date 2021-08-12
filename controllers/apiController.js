const fs = require("fs");
const path = require("path");
const {
  getAllRecentlyUnlockedAchievements,
  getNAchievementImages,
  getAchievementsSortedByRecent,
  paginateAchievements,
  getAchievementsSortedByRarity,
  getAchievementsSortedByGames,
  getAchievementsSortedByNameAZ,
  getAchievementsSortedByNameZA,
  getAllAchievementsRaw,
  getAllAchievementsRawForAGame,
  getAchievementsSortedByRarityEasy,
  getAchievementsSortedByRarityHard,
  getAchievementsSortedByHidden,
  paginateAchievementsNext,
  getDescForHiddenAchievement,
  getDescForHiddenAchievements,
  getAchievementsSortedByGamesAndTarget,
} = require("../helper/achivementHelper");
const {
  getGamesSortedByCompletionPercentage,
  getGamesSortedByPlaytime,
  getGamesSortedByNameAZ,
  getGamesSortedByNameZA,
  paginateGames,
  getAllPerfectGames,
  getNGameImages,
  getNPerfectGameImages,
  checkSelectionCriteriaFulfilled,
  checkSelectionCriteriaFulfilledForAchievement,
  checkSelectionCriteriaFulfilledForAchievementBacklog,
} = require("../helper/gamesHelper");
const { LOG } = require("../helper/logger");
const { writeLog } = require("../utils/fileUtils");
const { getHiddenInfoByCrawling } = require("./cacheController");

const ADD_TEST_DELAY = true;

exports.sendResponse = (res, data) => {
  if (ADD_TEST_DELAY) {
    setTimeout(() => {
      res.json(data);
    }, 200);
  } else {
    res.json(data);
  }
};

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
        return;
      }
      const database = JSON.parse(data);
      res.json(database);
    }
  );
};

exports.getAllGamesInfo = (req, res) => {
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      let gameInfo = {};
      let allPercentages = [];
      let totalGames = 0;
      let completedAchievements = 0;

      dbGames.map((game) => {
        allPercentages.push(game.completion_percentage);
        totalGames += 1;
        completedAchievements += game.completed_achievements_count;
      });

      gameInfo.total_games = totalGames;
      gameInfo.completed_achievements = completedAchievements;
      gameInfo.game_percentages = allPercentages;

      this.sendResponse(res, gameInfo);
    }
  );
};

exports.getGameInfo = (req, res) => {
  const gameid = req.query.gameid;
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      let gameInfo = {};

      const game = dbGames.filter((game) => {
        if (game.id + "" === gameid + "") {
          return true;
        } else {
          return false;
        }
      })[0];

      gameInfo.playtime_minutes = game.playtime_minutes;
      gameInfo.total_achievements_count = game.total_achievements_count;
      gameInfo.completed_achievements_count = game.completed_achievements_count;
      gameInfo.completion_percentage = game.completion_percentage;

      this.sendResponse(res, gameInfo);
    }
  );
};

exports.getImagesForOverlay = (req, res) => {
  const gamesCount = req.query.games ?? 1;
  const achievementCount = req.query.achievements ?? 1;
  const perfectGamesCount = req.query.perfectgames ?? 1;

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const allGames = JSON.parse(data).games;
      const perfectGames = getAllPerfectGames(allGames);
      const allRecentlyUnlockedAchievements = getAllRecentlyUnlockedAchievements(
        allGames
      );

      const gameImages = getNGameImages(allGames, gamesCount);
      const achievmentImages = getNAchievementImages(
        allRecentlyUnlockedAchievements,
        achievementCount
      );
      const perfectImages = getNPerfectGameImages(
        perfectGames,
        perfectGamesCount
      );

      this.sendResponse(res, {
        game_images: gameImages,
        achievement_images: achievmentImages,
        perfect_game_images: perfectImages,
      });
    }
  );
};

exports.getAllGames = (req, res) => {
  const select = req.query.select ?? "";
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "";
  const page = req.query.page ?? "0";

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      let games = [];
      dbGames.forEach((dbGame) => {
        if (checkSelectionCriteriaFulfilled(dbGame, select)) {
          let game = {};
          game.name = dbGame.name;
          game.id = dbGame.id;
          game.image = dbGame.image;
          game.playtime_minutes = dbGame.playtime_minutes;
          game.total_achievements_count = dbGame.total_achievements_count;
          game.completed_achievements_count =
            dbGame.completed_achievements_count;
          game.completion_percentage = dbGame.completion_percentage;
          games.push(game);
        } else {
        }
      });

      let sortedGames = [];
      if (sort === "completion")
        sortedGames = getGamesSortedByCompletionPercentage(games);
      if (sort === "playtime") sortedGames = getGamesSortedByPlaytime(games);
      if (sort === "name" && order === "az")
        sortedGames = getGamesSortedByNameAZ(games);
      if (sort === "name" && order === "za")
        sortedGames = getGamesSortedByNameZA(games);

      const totalGamesBeforePagination = sortedGames.length;

      const paginatedGames = paginateGames(sortedGames, page);

      this.sendResponse(res, {
        total: totalGamesBeforePagination,
        games: paginatedGames,
      });
    }
  );
};

exports.getAllAchievements = (req, res) => {
  const select = req.query.select ?? "";
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "az";
  const page = req.query.page ?? "0";
  const type = req.query.type ?? "easy";

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      const achievementsBeforeFiltering = getAllAchievementsRaw(dbGames);

      let achievements = [];
      achievementsBeforeFiltering.forEach((achievement) => {
        if (
          checkSelectionCriteriaFulfilledForAchievement(achievement, select)
        ) {
          achievements.push(achievement);
        } else {
        }
      });

      let sortedAchievements = [];
      if (sort === "recent")
        sortedAchievements = getAchievementsSortedByRecent(achievements);
      if (sort === "rarity" && type === "easy")
        sortedAchievements = getAchievementsSortedByRarityEasy(achievements);
      if (sort === "rarity" && type === "hard")
        sortedAchievements = getAchievementsSortedByRarityHard(achievements);
      if (sort === "games")
        sortedAchievements = getAchievementsSortedByGames(achievements);
      if (sort === "name" && order === "az")
        sortedAchievements = getAchievementsSortedByNameAZ(achievements);
      if (sort === "name" && order === "za")
        sortedAchievements = getAchievementsSortedByNameZA(achievements);

      const totalAchievementsBeforePagination = sortedAchievements.length;

      const paginatedAchievements = paginateAchievements(
        sortedAchievements,
        page
      );

      this.sendResponse(res, {
        total: totalAchievementsBeforePagination,
        achievements: paginatedAchievements,
      });
    }
  );
};

exports.getAllAchievementsBacklog = (req, res) => {
  const select = req.query.select ?? "";
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "az";
  const page = req.query.page ?? "0";
  const type = req.query.type ?? "easy";
  const target = req.query.target ?? 50;

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    async (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      const startedGames = dbGames.filter((game) => {
        if (game.completed_achievements_count > 0) {
          return true;
        } else {
          return false;
        }
      });

      let achievementsBeforeFiltering = getAllAchievementsRaw(startedGames);
      achievementsBeforeFiltering = await getAchievementsSortedByGamesAndTarget(
        startedGames,
        target
      );

      let achievements = [];
      achievementsBeforeFiltering.forEach((achievement) => {
        if (
          checkSelectionCriteriaFulfilledForAchievementBacklog(
            achievement,
            select
          )
        ) {
          achievements.push(achievement);
        } else {
        }
      });

      let sortedAchievements = [];
      if (sort === "recent")
        sortedAchievements = getAchievementsSortedByRecent(achievements);
      if (sort === "rarity" && type === "easy")
        sortedAchievements = getAchievementsSortedByRarityEasy(achievements);
      if (sort === "rarity" && type === "hard")
        sortedAchievements = getAchievementsSortedByRarityHard(achievements);
      if (sort === "games")
        sortedAchievements = await getAchievementsSortedByGamesAndTarget(
          startedGames,
          target
        );
      if (sort === "name" && order === "az")
        sortedAchievements = getAchievementsSortedByNameAZ(achievements);
      if (sort === "name" && order === "za")
        sortedAchievements = getAchievementsSortedByNameZA(achievements);

      const totalAchievementsBeforePagination = sortedAchievements.length;

      const paginatedAchievements = paginateAchievements(
        sortedAchievements,
        page
      );

      this.sendResponse(res, {
        total: totalAchievementsBeforePagination,
        achievements: paginatedAchievements,
      });
    }
  );
};

exports.getAllAchievementsNext = (req, res) => {
  const page = req.query.page ?? "1";
  const target = req.query.target ?? "50";
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    async (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      const startedGames = dbGames.filter((game) => {
        if (
          game.completed_achievements_count > 0 &&
          game.completion_percentage < target
        ) {
          return true;
        } else {
          return false;
        }
      });

      const gamesSortedByCompletion = getGamesSortedByCompletionPercentage(
        startedGames
      );

      const achievementsBeforeFiltering = getAllAchievementsRaw(
        gamesSortedByCompletion
      );

      let sortedAchievements = [];
      sortedAchievements = achievementsBeforeFiltering;

      const totalAchievementsBeforePagination = sortedAchievements.length;

      const paginatedAchievements = paginateAchievementsNext(
        sortedAchievements,
        page
      );

      const descriptionAddedAchievement = await getDescForHiddenAchievements(
        paginatedAchievements[0]
      );

      this.sendResponse(res, {
        total: totalAchievementsBeforePagination,
        achievements: [descriptionAddedAchievement],
      });
    }
  );
};

exports.getAllAchievementsForGame = (req, res) => {
  const game = req.query.game ?? "";
  const select = req.query.select ?? "";
  const sort = req.query.sort ?? "";
  const order = req.query.order ?? "";
  const page = req.query.page ?? "0";
  const type = req.query.type ?? "easy";

  let completed = 0;
  let remaining = 0;

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const dbGames = JSON.parse(data).games;

      const achievementsBeforeFiltering = getAllAchievementsRawForAGame(
        dbGames,
        game
      );

      let achievements = [];
      achievementsBeforeFiltering.forEach((achievement) => {
        if (
          checkSelectionCriteriaFulfilledForAchievement(achievement, select)
        ) {
          achievements.push(achievement);
        } else {
        }
        if (achievement.unlocked === 1) {
          completed++;
        }
      });

      let sortedAchievements = [];
      if (sort === "recent")
        sortedAchievements = getAchievementsSortedByRecent(achievements);
      if (sort === "hidden")
        sortedAchievements = getAchievementsSortedByHidden(achievements);
      if (sort === "rarity" && type === "easy")
        sortedAchievements = getAchievementsSortedByRarityEasy(achievements);
      if (sort === "rarity" && type === "hard")
        sortedAchievements = getAchievementsSortedByRarityHard(achievements);
      if (sort === "games")
        sortedAchievements = getAchievementsSortedByGames(achievements);
      if (sort === "name" && order === "az")
        sortedAchievements = getAchievementsSortedByNameAZ(achievements);
      if (sort === "name" && order === "za")
        sortedAchievements = getAchievementsSortedByNameZA(achievements);

      const totalAchievementsBeforePagination = sortedAchievements.length;

      const paginatedAchievements = paginateAchievements(
        sortedAchievements,
        page
      );

      remaining = totalAchievementsBeforePagination - completed;

      this.sendResponse(res, {
        completed: completed,
        remaining: remaining,
        total: totalAchievementsBeforePagination,
        achievements: paginatedAchievements,
      });
    }
  );
};

exports.getHiddenAchievementsForGameByID = async (req, res) => {
  const gameID = req.query.gameid ?? "";
  getHiddenInfoByCrawling(gameID).then((achievements) => {
    res.json(achievements);
  });
};

exports.getAllAchievementsForAYear = (req, res) => {
  const year = req.query.year ?? new Date().getFullYear();

  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const database = JSON.parse(data);
      const games = database.games;
      const achievementsForTheYear = [];
      games.map((game) => {
        const achievementsUnlocked = game.all_achievements.forEach(
          (achievement) => {
            if (
              achievement.unlocked_time_desc &&
              achievement.unlocked_time_desc.includes(year)
            ) {
              achievementsForTheYear.push(achievement);
            }
          }
        );
      });
      const recentlyUnlockedSorted = achievementsForTheYear.sort(
        (ach1, ach2) => {
          return ach2.unlocked_time - ach1.unlocked_time;
        }
      );
      res.json(achievementsForTheYear);
    }
  );
};

exports.getAllMilestoneAchievements = (req, res) => {
  fs.readFile(
    path.join(__dirname, "../", "store", "games.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return;
      }
      const database = JSON.parse(data);
      const games = database.games;
      const allAchievements = [];
      games.map((game) => {
        const achievementsUnlocked = game.all_achievements.forEach(
          (achievement) => {
            if (achievement.unlocked === 1) {
              allAchievements.push(achievement);
            }
          }
        );
      });
      const recentlyUnlockedSorted = allAchievements.sort((ach1, ach2) => {
        return ach2.unlocked_time - ach1.unlocked_time;
      });

      const everyTenthAchievement = recentlyUnlockedSorted.filter(
        (achievement, index) => {
          if (index % 10 === 0) {
            return true;
          } else {
            return false;
          }
        }
      );

      res.json(everyTenthAchievement);
    }
  );
};
