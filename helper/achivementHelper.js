const { nameZAComparator, nameAZComparator } = require("./comparator");

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
