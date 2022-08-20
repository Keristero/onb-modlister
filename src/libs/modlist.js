const {open_json,save_to_json,sanitize_string,AsyncLock} = require('./helpers.js')
const modlist_json_path = `./modlist.json`

const json_lock = new AsyncLock()
class Modlist{
    constructor(){
        this.has_changed_since_last_get_all = true
    }
    async load_modlist(){
        await json_lock.promise
        json_lock.enable()
        this.modlist = await open_json(modlist_json_path)
        json_lock.disable()
        console.log(`loaded mod list ${Object.keys(this.modlist).length} mods`)
        this.has_changed_since_last_get_all = true
    }
    get_mod_by_id(mod_id){
        let sane_id = sanitize_string(mod_id)
        if(this.modlist[sane_id]){
            return this.modlist[sane_id]
        }
        return null
    }
    get_all(){
        this.has_changed_since_last_get_all = false
        return this.modlist
    }
    get_all_whitelist(){
        let result = []
        for(let sane_mod_id in this.modlist){
            let mod = this.modlist[sane_mod_id]
            console.log(mod)
            result.push(`${mod.data.hash} ${mod.data.id}`)
        }
        return result.join('\n')
    }
    async save_modlist(){
        await json_lock.promise
        json_lock.enable()
        await save_to_json(modlist_json_path,this.modlist)
        json_lock.disable()
    }
    async get_mod_by_attachment_id(attachment_id){
        for(let sanitized_package_id in this.modlist){
            let mod = this.modlist[sanitized_package_id]
            if(mod.attachment_data.attachment_id == attachment_id){
                return mod
            }
        }
    }
    async remove_mod_by_attachment_id(attachment_id){
        let mod = await this.get_mod_by_attachment_id(attachment_id)
        if(!mod){
            return
        }
        delete this.modlist[sanitize_string(mod.data.id)]
        await this.save_modlist()
    }
    async test_mod_update_validity(mod_info,attachment_metadata){
        let new_mod = {
            data:mod_info,
            attachment_data:attachment_metadata
        }
        let mod_id = sanitize_string(new_mod.data.id)
        let mod_timestamp = new_mod.attachment_data.timestamp
        let mod_author = new_mod.attachment_data.author_id

        //get exising mod with the same id, if there is one
        let existing_mod = this.get_mod_by_id(mod_id)
        if(existing_mod){
            //if there is an existing mod by the same author, we can replace it
            let existing_mod_author = existing_mod.attachment_data.author_id
            let existing_mod_timestamp = existing_mod.attachment_data.timestamp

            if(existing_mod_author != mod_author){
                //dont replace an existing mod with a mod from another author
                return 'author'
            }

            if(existing_mod_timestamp > mod_timestamp){
                //dont replace an existing mod with an older mod (based on message date)
                return 'old'
            }
        }
        return 'valid'
    }
    async add_mod(mod_info,attachment_metadata){
        let new_mod = {
            data:mod_info,
            attachment_data:attachment_metadata
        }
        let mod_id = sanitize_string(new_mod.data.id)

        this.modlist[mod_id] = new_mod
        await this.save_modlist()
        this.has_changed_since_last_get_all = true
        return 'added'
    }
}

let modlist = new Modlist()
module.exports = modlist