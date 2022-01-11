const { DISCORD_TOKEN, MODS_CHANNEL_ID } = require('../environment')
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const https = require('https'); // or 'https' for https:// URLs
const {constants, createWriteStream, unlink} = require('fs')
const { resolve } = require('path')
const { access } = require('fs/promises')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    main()
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

async function main() {
    let attachments = await get_all_attachments_in_channel(client, MODS_CHANNEL_ID)
    console.log(`got list of all attachments`)
    console.log(attachments)
    for (let attachment of attachments) {
        let download_path = resolve(`./mods/${attachment.id}.zip`)
        let already_downloaded = await file_exists(download_path)
        if(already_downloaded){
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

function get_all_attachments_in_channel(client, channel_id) {
    return new Promise(async (resolve, reject) => {
        const channel = await client.channels.fetch(channel_id)
        const fetched_threads = await channel.threads.fetch()
        let attachments = []
        //console.log(fetched_threads)
        fetched_threads.threads.forEach(async (thread) => {
            const messages = await thread.messages.fetch()
            messages.forEach(async (message) => {
                message.attachments.forEach((attachment) => {
                    attachments.push(attachment)
                })
            })
            resolve(attachments)
        })
    })
}


client.login(DISCORD_TOKEN);