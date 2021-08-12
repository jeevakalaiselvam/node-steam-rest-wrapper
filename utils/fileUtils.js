const fs = require("fs");
const path = require("path");
const { LOG } = require("../helper/logger");

exports.writeLog = (data, fileName) => {
  fs.appendFile(
    path.join(__dirname, "../", "logs", fileName),
    JSON.stringify(data),
    (err) => {
      if (err) LOG("ERROR WRITING TO FILE -> ", err.message);
      else LOG(`FILE WRITE ${fileName} SUCCESS`);
    }
  );
};

exports.writeHiddenData = (data, fileName) => {
  fs.writeFile(fileName, data, (err) => {
    if (err) LOG("ERROR WRITING TO FILE -> ", err.message);
    else LOG(`FILE WRITE ${fileName} SUCCESS`);
  });
};
