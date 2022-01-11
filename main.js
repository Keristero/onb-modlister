const bot = require('./discord-bot/bot.js')
const { scrapePackage } = require('./package-scraper/scrapePackage.js')

const fs = require("fs");


/* const data = fs.readFileSync("test.zip");
scrapePackage(data)
  .then(console.log)
  .catch((e) => console.error(e.stack)); */
