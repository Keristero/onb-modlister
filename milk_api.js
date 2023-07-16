const axios = require('axios');
//For updating remote modlist when we update our local modlist
const { MILK_API_TOKEN, MILK_API_URL } = require('./environment')

//NOTE for testing I've change the port from default, im not logging in to the bot, and I'm iterating over the modlist (only the first non skin mod) to test the API

async function sync_mod(old_mod,mod){
    console.log("[MilkAPI] syncing mod",MILK_API_TOKEN,MILK_API_URL)
    if (!MILK_API_TOKEN || !MILK_API_URL){
        return
    }
    //Work out if we should POST or PUT based on if we already have an ID saved for this API
    let is_update = false
    if( old_mod && old_mod.milk_id != undefined){
        mod.milk_id = old_mod.milk_id
        is_update = true
    }

    let options = {
        headers:{
            "Authorization":`Bearer ${MILK_API_TOKEN}`
        }
    }

    let req_body = {
        "package_id": mod?.data?.id,
        "type": mod?.data?.type,
        "name": mod.data.name,
        "shortname": mod?.data?.detail?.props?.shortname,
        "description": mod?.data?.detail?.props?.description || mod?.data?.description,
        "previewZipPath": mod?.data?.detail?.preview_zip,
        "iconZipPath": mod?.data?.detail?.icon_zip,
        "discordDownloadLink": mod?.attachment_data?.discord_url,
        "author": {
            "authorName": mod?.attachment_data?.author_name,
            "authorId": mod?.attachment_data?.author_id,
            "threadName": mod?.attachment_data?.thread_name,
            "threadId": mod?.attachment_data?.thread_id,
            "attachmentId": mod?.attachment_data?.attachment_id,
            "channelId": mod?.attachment_data?.channel_id,
            "guildId": mod?.attachment_data?.guild_id
        },
        "chipInformation": {
            "long_description": mod?.data?.detail?.props?.long_description,//new field from my side
            "subpackages":mod?.data?.subpackages || [], //new field from my side
            "dependencies":mod?.data?.dependencies || [], //new field from my side
            "ncp_color": mod?.data?.detail?.color, //new field from my side
            "codes": mod?.data?.detail?.codes || [],
            "damage": mod?.data?.detail?.props?.damage,
            "time_freeze": mod?.data?.detail?.props?.time_freeze,
            "element": mod?.data?.detail?.props?.element,
            "limit": mod?.data?.detail?.props?.limit,
            "can_boost": mod?.data?.detail?.props?.can_boost,
            "shape": mod?.data?.detail?.shape || [],
            "is_program": mod?.data?.detail?.is_program,
            "card_class": mod?.data?.detail?.props?.card_class
        }
    }

    console.log("[MilkAPI] ->",req_body)
    let success = false
    let response = await axios.put(MILK_API_URL,req_body,options)
    if(response.status == 200){
        console.log("NICE")
    }
    console.log("[MilkAPI] <-",response)
}

module.exports = {sync_mod}