const { GAMES_PAGINATION_PER_PAGE } = require("../config/pagingConfig");
const { nameAZComparatorGame, nameZAComparatorGame } = require("./comparator");

exports.paginateGames = (games, page) => {
  const startIndex = (page - 1) * GAMES_PAGINATION_PER_PAGE;
  const lastIndex = page * GAMES_PAGINATION_PER_PAGE;

  if (page === "0") {
    return games;
  }

  if (games.length < lastIndex) {
    return games.slice(games.length - GAMES_PAGINATION_PER_PAGE, games.length);
  }
  return games.slice(startIndex, lastIndex);
};

exports.getAllPerfectGames = (games) => {
  let perfectGames = [];
  games.forEach((game) => {
    if (game.completion_percentage >= 80) {
      perfectGames.push(game);
    }
  });

  return perfectGames;
};

exports.getNGameImages = (games, count) => {
  let images = [];
  games.forEach((game) => {
    images.push(game.image);
  });
  return images;
};

exports.getNPerfectGameImages = (games, count) => {
  let images = [];
  games.forEach((game) => {
    images.push(game.image);
  });
  return images;
};

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
  newGames = games.sort(nameAZComparatorGame);

  return newGames;
};

exports.getGamesSortedByNameZA = (games) => {
  let newGames = [];
  newGames = games.sort(nameZAComparatorGame);
  return newGames;
};

exports.checkSelectionCriteriaFulfilled = (game, select, target) => {
  if (select === "all") {
    return true;
  } else if (select === "completed") {
    if (game.completion_percentage >= +target) {
      return true;
    }
  } else if (select === "started") {
    if (game.completed_achievements_count > 0) {
      return true;
    }
  } else if (select == "notstarted") {
    if (game.completed_achievements_count === 0) {
      return true;
    }
  } else {
    return false;
  }
};

exports.checkSelectionCriteriaFulfilledForAchievement = (
  achievement,
  select
) => {
  if (select === "all") {
    return true;
  } else if (select === "unlocked") {
    console.log(achievement);
    if (achievement.unlocked == 1) {
      return true;
    } else {
      return false;
    }
  } else if (select === "locked") {
    if (achievement.unlocked === 0) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

exports.checkSelectionCriteriaFulfilledForAchievementBacklog = (
  achievement,
  select
) => {
  if (achievement.unlocked === 0) {
    return true;
  } else {
    return false;
  }
};
