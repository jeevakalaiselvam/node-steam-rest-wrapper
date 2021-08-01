const fs = require("fs");

exports.writeLog = (data, fileName) => {
  fs.appendFile(`./log/${fileName}`, data, (err) => {
    if (err) console.log("ERROR WRITING TO FILE");
    else console.log(`FILE WRITE ${fileName} SUCCESS`);
  });
};
