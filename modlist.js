const { ThreadChannel } = require('discord.js')
const {open_json,save_to_json,sanitize_string} = require('./helpers.js')
const modlist_json_path = `./modlist.json`

class Modlist{
    constructor(){
    }
    async load_modlist(){
        this.modlist = await open_json(modlist_json_path)
    }
    get_mod_by_id(mod_id){
        if(this.modlist[mod_id]){
            return this.modlist[mod_id]
        }
        return null
    }
    async add_mod(mod_info,attachment_metadata){
        let new_mod = {
            data:mod_info,
            attachement_data:attachment_metadata
        }
        let mod_id = sanitize_string(new_mod.data.id)
        let mod_timestamp = new_mod.attachement_data.timestamp
        let mod_author = new_mod.attachement_data.author_id

        //get exising mod with the same id, if there is one
        let existing_mod = this.get_mod_by_id(mod_id)
        if(existing_mod){
            //if there is an existing mod by the same author, we can replace it
            let existing_mod_author = existing_mod.attachement_data.author_id
            let existing_mod_timestamp = existing_mod.attachement_data.timestamp

            if(existing_mod_author != mod_author){
                //dont replace an existing mod with a mod from another author
                return
            }

            if(existing_mod_timestamp < mod_timestamp){
                //dont replace an existing mod with an older mod (based on message date)
                return
            }
        }

        this.modlist[mod_id] = new_mod
        await save_to_json(modlist_json_path,this.modlist)
    }
}

let modlist = new Modlist()
module.exports = modlist