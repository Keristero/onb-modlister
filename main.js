const https = require('https'); // or 'https' for https:// URLs
const {constants, createWriteStream, unlink} = require('fs')
const { resolve } = require('path')
const { access } = require('fs/promises')
const fs = require("fs");

const { scrapePackage } = require('./package-scraper/scrapePackage.js')
const bot = require('./discord-bot/bot.js')

bot.on('ready',()=>{
  main()
})

async function main() {
  let attachments = await bot.get_all_attachments_in_channel()
  console.log(`got list of all attachments`)
  for (let attachment of attachments) {
      let download_path = resolve(`./mods/${attachment.id}.zip`)
      let already_downloaded = await file_exists(download_path)
      if(already_downloaded){
        console.log(`already downloaded ${attachment.name}`)
          continue
      }
      console.log(`started downloading ${attachment.name}`)
      await download(attachment.url, download_path)
      console.log(`successfully downloaded ${attachment.name}`)
  }
}

function download(url, destination_file) {
  return new Promise((resolve, reject) => {
      let file = createWriteStream(destination_file, { flags: 'w' });
      let request = https.get(url, function (response) {
          response.pipe(file);
          file.on('finish', function () {
              file.close(resolve);  // close() is async, call cb after close completes.
          });
      }).on('error', function (err) { // Handle errors
          unlink(destination_file); // Delete the file async. (But we don't check the result)
          reject(err)
      });
  })
};

async function file_exists(file_path) {
  try {
      await access(file_path, constants.R_OK | constants.W_OK);
      return true
  } catch {
      return false
  }
}


/* const data = fs.readFileSync("test.zip");
scrapePackage(data)
  .then(console.log)
  .catch((e) => console.error(e.stack)); */
