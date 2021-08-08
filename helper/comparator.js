exports.nameAZComparator = (game1, game2) => {
  if (game1.name.toLowerCase() < game2.name.toLowerCase()) return -1;
  if (game1.name.toLowerCase() > game2.name.toLowerCase()) return 1;
  return 0;
};

exports.nameZAComparator = (game1, game2) => {
  if (game1.name.toLowerCase() > game2.name.toLowerCase()) return -1;
  if (game1.name.toLowerCase() < game2.name.toLowerCase()) return 1;
  return 0;
};
