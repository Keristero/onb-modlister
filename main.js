const https = require('https'); // or 'https' for https:// URLs
const {createWriteStream, unlink } = require('fs')
const { resolve, parse } = require('path')
const {file_exists,write_image_data_to_file} = require('./helpers.js')
const { readFile } = require('fs/promises')

const { scrapePackage } = require('./package-scraper/scrapePackage.js')
const bot = require('./discord-bot/bot.js')
const mod_list = require('./modlist.js');
const modlist = require('./modlist.js');

bot.on('ready', () => {
    main()
})

async function main() {
    //load existing list of mods from json file
    await mod_list.load_modlist()

    //get a list of all attachements in the mods channel
    let attachments = await bot.get_all_attachments_in_channel()
    console.log(`got list of all attachments`)

    //iterate over each attachement and download it if we have not already got a copy in /mods
    let new_attachments = []
    for (let attachment of attachments) {
        if (attachment.contentType != 'application/zip'){
            //skip non zip attachments
            continue
        }
        attachment.path = resolve(`./mods/${attachment.id}.zip`)
        let already_downloaded = await file_exists(attachment.path)
        if (already_downloaded) {
            console.log(`already downloaded ${attachment.name}`)
            continue
        }
        console.log(`started downloading ${attachment.name}`)
        await download(attachment.url, attachment.path)
        console.log(`successfully downloaded ${attachment.name}`)
        //add any newly downloaded attachments to a list for parsing
        new_attachments.push(attachment)
    }

    //parse each new attachement and add them to the modlist
    for(let attachment of new_attachments){
        console.log('attachement',attachment)
        let attachment_metadata = {
            timestamp:attachment.timestamp,
            modlister_file_path:attachment.path,
            discord_url:attachment.attachment,
            author_name: attachment.author_name,
            author_id: attachment.author_id,
            original_filename:attachment.name,
            attachment_id:attachment.id
        }
        let mod_info = await parse_mod_info(attachment.path)
        console.log(mod_info)
        //save images from mod_info to disk for previewing
        if(mod_info.detail.icon){
            let image_path = await write_image_data_to_file(`./images`,`${mod_info.id}_icon`,'png',mod_info.detail.icon)
            mod_info.detail.icon = image_path
        }
        if(mod_info.detail.preview){
            let image_path = await write_image_data_to_file(`./images`,`${mod_info.id}_preview`,'png',mod_info.detail.preview)
            mod_info.detail.preview = image_path
        }
        
        await modlist.add_mod(mod_info,attachment_metadata)
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

async function parse_mod_info(package_path){
    let data = await readFile(package_path)
    let mod_info  = await scrapePackage(data)
    return mod_info
}