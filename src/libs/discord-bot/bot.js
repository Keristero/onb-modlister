const { DISCORD_TOKEN, MODS_CHANNEL_ID ,SKINS_CHANNEL_ID} = require('../environment')
const { Client, Intents} = require('discord.js');
const EventEmitter = require('events');

class Discordbot extends EventEmitter{
    constructor(token,channel_ids){
        super()
        this.token = token
        this.channel_ids = channel_ids
        console.log(`attempting discord login`)
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.emit('ready')
        });
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        });
        this.client.login(DISCORD_TOKEN);
    }
    async get_channels_by_ids(channel_ids){
        /**
         * takes an array of channel ids and returns an array of channels
         */
        let channels = []
        for(let channel_id of channel_ids){
            const channel = await this.client.channels.fetch(channel_id)
            channels.push(channel)
        }
        return channels
    }
    async get_attachment_thread(attachment){
        console.log(attachment)
        const channel = await this.client.channels.fetch(attachment.channel_id)
        const thread = await channel.threads.fetch(attachment.thread_id)
        return thread
    }
    async get_attachment_message(attachment){
        const thread = await this.get_attachment_thread(attachment)
        const message = await thread.messages.fetch(attachment.message_id)
        return message
    }
    async react_to_attachment_message(attachment,emoji){
        try{
            const thread = await this.get_attachment_thread(attachment)
            if (!thread || thread.archived){
                //cant react to archived threads
                return
            }
            const message = await this.get_attachment_message(attachment)
            if(!message){
                //cant react to messages that dont exist
                return
            }
            console.log(`reacting to message with`,emoji)
            message.reactions.removeAll()
            message.react(emoji);
            console.log(`reacted with`,emoji)
        }catch(e){
            console.log(`unable to react to message`,emoji,e)
        }
    }
    async poll_active_thread_attachments(every_x_seconds){
        const channels = await this.get_channels_by_ids(this.channel_ids)
        setInterval(async()=>{
            try{
                console.log('scanning active threads for new attachments...')
                let threads = await this.get_all_active_threads(channels)
                let attachments = await this.get_all_attachments_from_list_of_threads(threads)
                if(attachments.length > 0){
                    this.emit('active_thread_attachments',attachments)
                }
            }catch(e){
                console.log('periodic polling for attachments failed with error',e)
            }
        },every_x_seconds*1000)
    }
    async get_all_active_threads(channels){
        let threads
        for(let channel of channels){
            let fetched_active_threads = await channel.threads.fetchActive()
            if(!threads){
                threads = fetched_active_threads.threads
            }else{
                threads = threads.concat(fetched_active_threads.threads)
            }
            
            while(fetched_active_threads.hasMore){
                let options = {before:fetched_active_threads.threads.last()}
                fetched_active_threads = await channel.threads.fetchActive(options)
                threads = threads.concat(fetched_active_threads.threads)
            }
        }
        return threads
    }
    async get_all_archived_threads(channels){
        let threads
        for(let channel of channels){
            console.log(`getting archived threads in ${channel.name}`)
            let fetched_archived_threads = await channel.threads.fetchArchived()
            if(!threads){
                threads = fetched_archived_threads.threads
            }else{
                threads = threads.concat(fetched_archived_threads.threads)
            }
            
            while(fetched_archived_threads.hasMore){
                let options = {before:fetched_archived_threads.threads.last()}
                fetched_archived_threads = await channel.threads.fetchArchived(options)
                threads = threads.concat(fetched_archived_threads.threads)
            }
        }
        return threads
    }
    async get_all_attachments_in_channels(){
        const channels = await this.get_channels_by_ids(this.channel_ids)
        //fetch all threads from channel, active and inactive
        let threads = await this.get_all_active_threads(channels)
        console.log('active threads',threads)
        let archived_threads = await this.get_all_archived_threads(channels)
        threads = threads.concat(archived_threads)
        console.log('fetched',threads.size,'threads')
        let attachments = await this.get_all_attachments_from_list_of_threads(threads)
        return attachments
    }
    async get_all_messages_in_thread(thread) {
        const sum_messages = [];
        let last_id;
        const options = {limit: 100};
        const loop = true; // satisfy no-constant-condition
        while (loop) {
            if (last_id) {
                options.before = last_id;
            }
            let messages = await thread.messages.fetch(options)
            sum_messages.push(...messages.map((item)=>{return item}));
            if(messages.last()){
                last_id = messages.last().id;
            }else{
                break;
            }
            if (messages.size != 100) {
                break;
            }
        }
        return sum_messages;
    }
    get_all_attachments_from_list_of_threads(threads){
        let thread_promises = []
        let attachments = []
        return new Promise(async(resolve)=>{
            try{
                threads.forEach(async (thread) => {
                    let thread_fetch = this.get_all_messages_in_thread(thread)
                    thread_promises.push(thread_fetch)
                    const messages = await thread_fetch
                    messages.forEach((message) => {
                        message.attachments.forEach((attachment) => {
                            //add required extra meta data to the attachment object
                            attachment.timestamp = message.createdTimestamp
                            attachment.author_name = message.author.username
                            attachment.author_id = message.author.id
                            attachment.message_id = message.id
                            attachment.thread_id = thread.id
                            attachment.thread_name = thread.name
                            attachment.channel_id = thread.parentId
                            attachment.guild_id = message.guildId
                            //add attachment to list
                            attachments.push(attachment)
                        })
                    })
                })
                await Promise.all(thread_promises)
                console.log(`got ${attachments.length} attachments`)
                resolve(attachments)
            }catch(e){
                console.log('failed to get attachments from threads',e)
                reject(e)
            }
        })
    }
}

const bot = new Discordbot(DISCORD_TOKEN,[MODS_CHANNEL_ID,SKINS_CHANNEL_ID])

module.exports = bot