const { GAMES_PAGINATION_PER_PAGE } = require("../config/pagingConfig");

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
