const {
  nameZAComparator,
  nameAZComparator,
  sortByRecentlyUnlocked,
  sortByRarityAchievementDesc,
  sortByGamesAchievement,
  nameAZComparatorAchievement,
  nameZAComparatorAchievement,
} = require("./comparator");

const { ACHIEVEMENTS_PAGINATION_PER_PAGE } = require("../config/pagingConfig");

exports.paginateAchievements = (achievements, page) => {
  const startIndex = (page - 1) * ACHIEVEMENTS_PAGINATION_PER_PAGE;
  const lastIndex = page * ACHIEVEMENTS_PAGINATION_PER_PAGE;

  if (page === "0") {
    return achievements;
  }

  if (achievements.length < lastIndex) {
    return achievements.slice(
      achievements.length - ACHIEVEMENTS_PAGINATION_PER_PAGE,
      achievements.length
    );
  }
  return achievements.slice(startIndex, lastIndex);
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

exports.getAchievementsSortedByRecent = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByRecentlyUnlocked);

  return sortedAchievments;
};

exports.getAchievementsSortedByRarity = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByRarityAchievementDesc);

  return sortedAchievments;
};

exports.getAchievementsSortedByGames = (achievements) => {
  let sortedAchievments = [];

  sortedAchievments = achievements.sort(sortByGamesAchievement);

  return sortedAchievments;
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
    gameAchievements.map((achievement) => {
      achievements.push(achievement);
    });
  });
  return achievements;
};
