const {
  nameZAComparator,
  nameAZComparator,
  sortByRecentlyUnlocked,
} = require("./comparator");

exports.getGamesSortedByCompletionPercentage = (games) => {
  let newGames = [];
  newGames = games.sort((game1, game2) => {
    return game2.completion_percentage - game1.completion_percentage;
  });

  return newGames;
};

exports.getGamesSortedByPlaytime = (games) => {
  let newGames = [];
  newGames = games.sort((game1, game2) => {
    return game2.playtime_minutes - game1.playtime_minutes;
  });

  return newGames;
};

exports.getGamesSortedByNameAZ = (games) => {
  let newGames = [];
  newGames = games.sort(nameAZComparator);

  return newGames;
};

exports.getGamesSortedByNameZA = (games) => {
  let newGames = [];
  newGames = games.sort(nameZAComparator);
  return newGames;
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
  let start = count;
  while (start > 0) {
    images.push(
      achievements[Math.floor(Math.random() * achievements.length)].icon
    );
    start--;
  }
  return images;
};
