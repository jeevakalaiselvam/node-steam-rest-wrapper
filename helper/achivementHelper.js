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
const { getHiddenInfoByCrawling } = require("../controllers/cacheController");
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

exports.getAchievementsSortedByGamesAndTarget = (games, target) => {
  let sortedGamesForTarget = this.getGamesForTarget(games, target);

  let allAchievements = [];

  sortedGamesForTarget.forEach((game) => {
    game.all_achievements.forEach((achievement) => {
      if (achievement.unlocked === 0) allAchievements.push(achievement);
    });
  });

  return allAchievements;
};

exports.getGamesForTarget = (games, target) => {
  LOG("GAMES LENGTH BEFORE SORTING -> ", games.length);
  let filteredGames = games.filter((game) => {
    LOG(
      `CHECKING GAME ${game.name} -> ${game.completion_percentage} AND ${target}`
    );
    if (game.completion_percentage < Number(target)) {
      LOG("ADDING -> ", game.name);
      return true;
    }
    return false;
  });

  filteredGames = filteredGames.sort((game1, game2) => {
    return game2.completion_percentage - game1.completion_percentage;
  });

  LOG(filteredGames[0].name);

  return filteredGames;
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
