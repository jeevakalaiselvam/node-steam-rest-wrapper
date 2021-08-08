exports.getGamesSortedByCompletionPercentage = (games) => {
  let newGames = [];
  newGames = games.sort((game1, game2) => {
    return game2.completion_percentage - game1.completion_percentage;
  });

  return newGames;
};
