const {
  nameZAComparator,
  nameAZComparator,
  sortByRecentlyUnlocked,
  sortByRarityAchievementDesc,
  sortByGamesAchievement,
  nameAZComparatorAchievement,
  nameZAComparatorAchievement,
  sortByRarityAchievementAsc,
  sortByHiddenOnly,
} = require("./comparator");

const {
  ACHIEVEMENTS_PAGINATION_PER_PAGE,
  ACHIEVEMENTS_PAGINATION_PER_PAGE_NEXT,
} = require("../config/pagingConfig");
const {
  getHiddenInfoByCrawling,
  getHiddenAchievementsForGame,
} = require("../controllers/cacheController");
const { LOG } = require("./logger");
const { getGamesSortedByCompletionPercentage } = require("./gamesHelper");

exports.paginateAchievements = (achievements, page) => {
  const startIndex = (page - 1) * ACHIEVEMENTS_PAGINATION_PER_PAGE;
  const lastIndex = page * ACHIEVEMENTS_PAGINATION_PER_PAGE;

  if (page === "0") {
    return achievements;
  }

  if (achievements.length < ACHIEVEMENTS_PAGINATION_PER_PAGE) {
    return achievements.slice(0, achievements.length);
  }

  if (achievements.length < lastIndex) {
    return achievements.slice(
      achievements.length - ACHIEVEMENTS_PAGINATION_PER_PAGE,
      achievements.length
    );
  }
  return achievements.slice(startIndex, lastIndex);
};

exports.paginateAchievementsNext = (achievements, page) => {
  return [achievements[page - 1]];
};

exports.getAllRecentlyUnlockedAchievements = (games) => {
  let allAchievements = this.getAllUnlockedAchievements(games);
  let recentSortedAchievements = allAchievements.sort(sortByRecentlyUnlocked);
  return recentSortedAchievements;
};

exports.getAllUnlockedAchievements = (games) => {
  let allAchievements = [];
  games.forEach((game) => {
    const achievements = game.all_achievements;
    achievements.forEach((achievement) => {
      if (achievement.unlocked === 1) {
        allAchievements.push(achievement);
      }
    });
  });
  return allAchievements;
};

exports.getNAchievementImages = (achievements, count) => {
  let images = [];
  achievements.forEach((achievement) => {
    images.push(achievement.icon);
  });
  return images;
};

exports.getAchievementsSortedByHidden = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByHiddenOnly);

  return sortedAchievments;
};

exports.getAchievementsSortedByRecent = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByRecentlyUnlocked);

  return sortedAchievments;
};

exports.getAchievementsSortedByRarityEasy = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByRarityAchievementAsc);

  return sortedAchievments;
};

exports.getAchievementsSortedByRarityHard = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByRarityAchievementDesc);

  return sortedAchievments;
};

exports.getAchievementsSortedByGames = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByGamesAchievement);

  return sortedAchievments;
};

exports.getAchievementsSortedByGamesAndTarget = async (games, target) => {
  let sortedGamesForTarget = await this.getGamesForTarget(games, target);

  let allAchievements = [];

  sortedGamesForTarget.forEach((game) => {
    game.all_achievements.forEach((achievement) => {
      if (achievement.unlocked === 0) allAchievements.push(achievement);
    });
  });

  return allAchievements;
};

exports.getGamesForTarget = async (games, target) => {
  let filteredGames = games.filter((game) => {
    if (game.completion_percentage < Number(target)) {
      return true;
    }
    return false;
  });

  filteredGames = filteredGames.sort((game1, game2) => {
    return game2.completion_percentage - game1.completion_percentage;
  });

  const allAchievements = {};

  await Promise.all(
    filteredGames.map(async (game) => {
      const allAchievementsForGame = await getHiddenInfoByCrawling(game.id);
      allAchievementsForGame.forEach((achievement) => {
        allAchievements[game.id + achievement.name] = achievement.description;
      });
      return "";
    })
  );

  console.log(allAchievements);

  const hiddenAchievementAddedGames = filteredGames.map((game) => {
    game.all_achievements = game.all_achievements.map((achievement) => {
      achievement.description = allAchievements[game.id + achievement.name];
      return achievement;
    });
    return game;
  });

  return hiddenAchievementAddedGames;
};

exports.getAchievementsSortedByNameAZ = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(nameAZComparatorAchievement);

  return sortedAchievments;
};

exports.getAchievementsSortedByNameZA = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(nameZAComparatorAchievement);

  return sortedAchievments;
};

exports.getAllAchievementsRaw = (games) => {
  let achievements = [];
  games.map((game) => {
    const gameAchievements = game.all_achievements;
    const gameAchievementSortedByEasyAndNotUnlocked = this.getAchievementsSortedByRarityEasy(
      gameAchievements
    );
    gameAchievementSortedByEasyAndNotUnlocked.map((achievement) => {
      achievement.game_completion = game.completion_percentage;
      if (achievement.unlocked === 0 && game.completion_percentage) {
        achievements.push(achievement);
      }
    });
  });
  return achievements;
};

exports.getAllAchievementsRawForAGame = (games, gameTmp) => {
  let achievements = [];

  games.map((game) => {
    if (+game.id === +gameTmp) {
      achievements = game.all_achievements;
    }
  });
  return achievements;
};

exports.getDescForHiddenAchievements = async (achievement) => {
  const gameId = achievement.game_id;

  const hiddenAchievements = await getHiddenInfoByCrawling(gameId);

  hiddenAchievements.map((achievementInner) => {
    if (
      achievementInner.name.toLowerCase().trim() ===
        achievement.name.toLowerCase().trim() &&
      achievement.hidden === 1
    ) {
      achievement.description = achievementInner.description;
    } else {
    }
  });

  return achievement;
};
