const fs = require("fs");
const path = require("path");

exports.writeLog = (data, fileName) => {
  fs.appendFile(
    path.join(__dirname, "../", "logs", fileName),
    JSON.stringify(data),
    (err) => {
      if (err) console.log("ERROR WRITING TO FILE -> ", err.message);
      else console.log(`FILE WRITE ${fileName} SUCCESS`);
    }
  );
};

exports.writeHiddenData = (data, fileName) => {
  fs.writeFile(fileName, data, (err) => {
    if (err) console.log("ERROR WRITING TO FILE -> ", err.message);
    else console.log(`FILE WRITE ${fileName} SUCCESS`);
  });
};
