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

exports.getAllPerfectGames = (games) => {
  let perfectGames = [];
  games.forEach((game) => {
    if (game.completion_percentage >= 80) {
      perfectGames.push(game);
    }
  });

  return perfectGames;
};

exports.getNRandomGameImages = (games, count) => {
  let images = [];
  let start = count;
  while (start > 0) {
    images.push(games[Math.floor(Math.random() * games.length)].image);
    start--;
  }
  return images;
};

exports.getNPerfectGameImages = (games, count) => {
  let images = [];
  let start = count;
  while (start > 0) {
    images.push(games[Math.floor(Math.random() * games.length)].image);
    start--;
  }
  return images;
};
