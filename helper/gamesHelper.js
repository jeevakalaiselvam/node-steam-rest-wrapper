exports.paginateGames = (games, page) => {
  const startIndex = (page - 1) * 25;
  const lastIndex = page * 25;

  if (page === "0") {
    return games;
  }

  if (games.length < lastIndex) {
    return games.slice(games.length - 25, games.length);
  }
  return games.slice(startIndex, lastIndex);
};
