const https = require('https'); // or 'https' for https:// URLs
const { createWriteStream, fstat } = require('fs')
const { resolve, parse, join } = require('path')
const { file_exists, write_image_data_to_file_compressed } = require('./helpers.js')
const { unlink, readdir } = require('fs/promises')

const { scrape_package } = require('./package-scraper/package_scraper.js')
const { zip_and_hash_package } = require('./zip_and_hash.js')
const bot = require('./discord-bot/bot.js')
const mod_list = require('./modlist.js')
const modlist = require('./modlist.js')
const webserver = require('./webserver.js')
const { SKINS_CHANNEL_ID, MODS_CHANNEL_ID } = require('./environment')

const images_path = "./images"
const mods_path = "mods/"
const good_mod_emoji = "✅"
const bad_mod_emoji = "❌"
const wrong_author_emoji = "🔒"
const archived_mod_emoji = "📁"

bot.on('ready', async() => {
    try{
        await refresh_all_mods()
    }catch(e){
        console.log('failed to refresh mods at startup, continuing anyway...')
    }
    remove_old_mods_regularly(60 * 60)//every hour
    await bot.poll_active_thread_attachments(60)//every minute

    bot.on('active_thread_attachments', async (attachments) => {
        let new_attachments = await download_new_attachments(attachments)
        await parse_attachments(new_attachments)
    })
})

main()


async function main() {
    //load existing list of mods from json file
    await mod_list.load_modlist()
}

function remove_old_mods_regularly(every_x_seconds) {
    setInterval(async () => {
        console.log('comparing cached mods against all attachments...')
        await remove_any_old_mods()
    }, every_x_seconds * 1000)
}

async function refresh_all_mods() {
    try {
        //get a list of all attachments in the mods channel
        let all_attachments = await bot.get_all_attachments_in_channels()
        console.log(`got list of all attachments`)
        let new_attachments = await download_new_attachments(all_attachments)

        //iterate over each attachment and download it if we have not already got a copy in /mods
        await parse_attachments(new_attachments)

        await remove_mods_not_in_attachment_list(all_attachments)
    } catch (e) {
        console.log(`failed refreshing all mods`, e)
    }
}

async function remove_any_old_mods() {
    try {
        let all_attachments = await bot.get_all_attachments_in_channels()
        await remove_mods_not_in_attachment_list(all_attachments)
    } catch (e) {
        console.log(`failed removing old mods `, e)
    }
}

async function remove_mods_not_in_attachment_list(all_attachments) {
    let attachments_to_delete = await list_attachments_to_be_deleted(all_attachments)
    console.log('attachments to delete', attachments_to_delete.length)
    for (let attachment_id of attachments_to_delete) {
        await modlist.remove_mod_by_attachment_id(attachment_id)
        await unlink(resolve(`${mods_path}/${attachment_id}.zip`))
    }
    console.log('deleted mods', attachments_to_delete.length)
}

async function list_attachments_to_be_deleted(attachment_list) {
    try {
        const mods_path_files = await readdir(mods_path);

        //filter out any non zip files
        const cached_mods = mods_path_files.filter((file_name) => {
            if (file_name.includes(".zip")) {
                return true
            }
            return false
        })

        //filter out all mods that appear in the attachment list
        const deleted_mods = cached_mods.filter((file_name) => {
            for (attachment of attachment_list) {
                if (file_name.includes(attachment.id)) {
                    return false
                }
            }
            return true
        })

        //remove .zip from the path to get the attachment id
        const deleted_attachments = deleted_mods.map((value) => {
            return value.split('.')[0]
        })

        return deleted_attachments
    } catch (err) {
        console.error(err);
    }
}

async function download_new_attachments(attachments) {
    //iterate over each attachment and download it if we have not already got a copy in /mods
    let new_attachments = []
    for (let attachment of attachments) {
        try {
            let attachment_type = identify_attachment_type(attachment)
            if (attachment_type == "unknown") {
                //skip non zip attachments
                continue
            }
            if(attachment_type == "skin_screenshot"){
                attachment.path = `${join(images_path, attachment.id)}.png`
            }
            if(attachment_type == "mod" || attachment_type == "skin"){
                attachment.path = resolve(`${join(mods_path, attachment.id)}.zip`)
            }

            let already_downloaded = await file_exists(attachment.path)
            if (already_downloaded) {
                //skip already downloaded attachments
                continue
            }
            console.log(`started downloading ${attachment.name}`)
            await download(attachment.url, attachment.path)
            console.log(`successfully downloaded ${attachment.name}`)
            new_attachments.push(attachment)
        } catch (e) {
            console.log(`error downloading file `, e)
        }
    }
    return new_attachments
}

async function parse_attachments(attachments) {
    //Sort new attachments so that screenshots will be processed last
    attachments.sort((a,b)=>{
        let type = identify_attachment_type(a)
        if(type == "skin_screenshot"){
            return 1
        }else{
            return -1
        }
    })
    //parse each new attachment and add them to the modlist
    for (let attachment of attachments) {
        try {
            console.log('attachment', attachment.name)
            let attachment_metadata = {
                timestamp: attachment.timestamp,
                discord_url: attachment.attachment,
                author_name: attachment.author_name,
                author_id: attachment.author_id,
                original_filename: attachment.name,
                attachment_id: attachment.id,
                thread_id: attachment.thread_id,
                thread_name: attachment.thread_name,
                channel_id: attachment.channel_id,
                guild_id: attachment.guild_id
            }
            let attachment_type = identify_attachment_type(attachment)

            if (attachment_type == "skin") {
                let mod_info = await parse_skin_info(attachment,attachment_metadata)
                await modlist.add_mod(mod_info, attachment_metadata)

            }else if(attachment_type == "skin_screenshot"){
                await add_screenshot_to_skin(attachment)
            }
            else if(attachment_type == "mod"){
                let mod_info = await parse_mod_info(attachment.path)
                if (!mod_info) {
                    console.log(`UNABLE TO PARSE MOD`, attachment)
                    await bot.react_to_attachment_message(attachment, bad_mod_emoji)
                    continue
                }

                let validity = await modlist.test_mod_update_validity(mod_info, attachment_metadata)
                if (validity == 'valid') {
                    //zip and hash the package using the game client
                    let client_res = await zip_and_hash_package(attachment.path, mod_info)
                    mod_info.hash = client_res.hash
                    //save images from mod_info to disk for previewing
                    if (mod_info?.detail?.icon) {
                        try{
                            let image_path = await write_image_data_to_file_compressed(`./images`, `${mod_info.id}_icon`, 'png', mod_info.detail.icon)
                            mod_info.detail.icon = image_path
                        }catch(e){
                            console.log('unable to compress image',image_path)
                        }
                    }
                    if (mod_info?.detail?.preview) {
                        try{
                            let image_path = await write_image_data_to_file_compressed(`./images`, `${mod_info.id}_preview`, 'png', mod_info.detail.preview)
                            mod_info.detail.preview = image_path
                        }catch(e){
                            console.log('unable to compress image',image_path)
                        }
                    }
                    await modlist.add_mod(mod_info, attachment_metadata)
                    await bot.react_to_attachment_message(attachment, good_mod_emoji)
                } else if (validity == 'author') {
                    await bot.react_to_attachment_message(attachment, wrong_author_emoji)
                } else if (validity == 'old') {
                    await bot.react_to_attachment_message(attachment, archived_mod_emoji)
                }
            }
        } catch (e) {
            console.log(`error parsing atachment`, e)
        }
    }
}

function identify_attachment_type(attachment){
    let type = "unknown"
    if(attachment.channel_id == SKINS_CHANNEL_ID){
        if(attachment.contentType == 'application/zip'){
            type = 'skin'
        }
        if(attachment.contentType == 'image/png'){
            type = 'skin_screenshot'
        }
    }
    if(attachment.channel_id == MODS_CHANNEL_ID){
        if(attachment.contentType == 'application/zip'){
            type = 'mod'
        }
    }
    return type
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

async function add_screenshot_to_skin(image_attachment){
    let skin_id = image_attachment.thread_id
    let skin_info = mod_list.get_mod_by_id(skin_id)
    if(!skin_info || skin_info.data.type != "skins"){
        return
    }
    if(image_attachment.author_id != skin_info.attachment_data.author_id){
        return
    }
    skin_info.data.screenshots.push(image_attachment.path)
    mod_list.add_mod(skin_info.data,skin_info.attachment_data)
    console.log('associated new screenshot to skin')
}

async function parse_skin_info(attachment,attachment_metadata){
    let new_skin_id = attachment_metadata.thread_id //since there is no user defined mod id.
    let attachment_thread = await bot.get_attachment_thread(attachment)
    let all_thread_messages = await bot.get_all_messages_in_thread(attachment_thread)
    let first_message = all_thread_messages[all_thread_messages.length-1]
    let data = {
        type:"skins",
        name:attachment_thread.name,
        id:new_skin_id,
        description:first_message.content.slice(0,Math.min(50,first_message.content.length)),
        discord_url: attachment.attachment,
        screenshots:[]
    }
    console.log('skin info',data)
    return data
}

async function parse_mod_info(package_path) {
    try {
        let mod_info = await scrape_package(package_path)
        return mod_info
    } catch (e) {
        console.log(`error parsing mod `, package_path)
        console.log(e)
        return null
    }
}