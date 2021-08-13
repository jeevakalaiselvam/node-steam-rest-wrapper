const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const axios = require("axios");

exports.getImageURLAfterDownloadAndUpscale = async (
  url,
  gameId,
  achievementId
) => {
  const imagePath = path.resolve(
    __dirname,
    "../",
    "public",
    "images",
    `${gameId}_${achievementId}.jpg`
  );

  fse.ensureFile(imagePath, async (err) => {
    const writer = fs.createWriteStream(imagePath);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  });
};
