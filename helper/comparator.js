exports.nameAZComparatorGame = (game1, game2) => {
  if (game1.name.toLowerCase() < game2.name.toLowerCase()) return -1;
  if (game1.name.toLowerCase() > game2.name.toLowerCase()) return 1;
  return 0;
};

exports.nameZAComparatorGame = (game1, game2) => {
  if (game1.name.toLowerCase() > game2.name.toLowerCase()) return -1;
  if (game1.name.toLowerCase() < game2.name.toLowerCase()) return 1;
  return 0;
};

exports.nameAZComparatorAchievement = (ach1, ach2) => {
  if (ach1.name.toLowerCase() < ach2.name.toLowerCase()) return -1;
  if (ach1.name.toLowerCase() > ach2.name.toLowerCase()) return 1;
  return 0;
};

exports.nameZAComparatorAchievement = (ach1, ach2) => {
  if (ach1.name.toLowerCase() > ach2.name.toLowerCase()) return -1;
  if (ach1.name.toLowerCase() < ach2.name.toLowerCase()) return 1;
  return 0;
};

exports.sortByRecentlyUnlocked = (ach1, ach2) => {
  return ach2.unlocked_time - ach1.unlocked_time;
};

exports.sortByRarityAchievementDesc = (ach1, ach2) => {
  return ach1.global_percentage - ach2.global_percentage;
};

exports.sortByRarityAchievementAsc = (ach1, ach2) => {
  return ach2.global_percentage - ach1.global_percentage;
};

exports.sortByGamesAchievement = (ach1, ach2) => {
  if (ach1.game_name.toLowerCase() < ach2.game_name.toLowerCase()) return -1;
  if (ach1.game_name.toLowerCase() > ach2.game_name.toLowerCase()) return 1;
  return 0;
};
