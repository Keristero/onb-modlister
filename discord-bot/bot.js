const { DISCORD_TOKEN, MODS_CHANNEL_ID } = require('../environment')
const { Client, Intents, CommandInteractionOptionResolver } = require('discord.js');
const EventEmitter = require('events');

class Discordbot extends EventEmitter{
    constructor(token,channel){
        super()
        this.token = token
        this.channel_id = channel
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.emit('ready')
        });
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            if (interaction.commandName === 'ping') {
                await interaction.reply('Pong!');
            }
        });
        this.client.login(DISCORD_TOKEN);
    }
    get_all_attachments_in_channel(){
        return new Promise(async (resolve, reject) => {
            const channel = await this.client.channels.fetch(this.channel_id)
            const fetched_threads = await channel.threads.fetch()
            let attachments = []
            //console.log(fetched_threads)
            fetched_threads.threads.forEach(async (thread) => {
                const messages = await thread.messages.fetch()
                messages.forEach(async (message) => {
                    message.attachments.forEach((attachment) => {
                        attachment.author_name = message.author.username
                        attachment.author_id = message.author.id
                        attachments.push(attachment)
                    })
                })
                resolve(attachments)
            })
        })
    }
}

const bot = new Discordbot(DISCORD_TOKEN,MODS_CHANNEL_ID)

module.exports = bot