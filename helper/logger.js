const chalk = require("chalk");

exports.LOG = (...data) => {
  const red = Math.ceil(Math.random() * 255);
  const green = Math.ceil(Math.random() * 255);
  const blue = Math.ceil(Math.random() * 255);
  console.log(
    chalk.rgb(
      red,
      green,
      blue
    )("----------------------------------------------------------")
  );
  console.log(chalk.rgb(red, green, blue)(...data));
};
