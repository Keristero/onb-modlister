const {open_json,save_to_json,sanitize_string,AsyncLock,write_image_data_to_file} = require('./helpers.js')
const serverlist_json_path = `./serverlist.json`
const server_images_folder = `./server_images/`

var net = require('net');

const json_lock = new AsyncLock()
class Serverlist{
    constructor(){
        this.has_changed_since_last_get_all = true
    }
    make_up_server_id(advertisement){
        return sanitize_string(`${advertisement.address}-${advertisement.data}`)
    }
    async load_modlist(){
        await json_lock.promise
        json_lock.enable()
        this.serverlist = await open_json(serverlist_json_path)
        json_lock.disable()
        console.log(`loaded server list ${Object.keys(this.serverlist).length} servers`)
        this.has_changed_since_last_get_all = true
    }
    get_all(){
        this.has_changed_since_last_get_all = false
        return this.serverlist
    }
    async save_serverlist(){
        await json_lock.promise
        json_lock.enable()
        await save_to_json(serverlist_json_path,this.serverlist)
        json_lock.disable()
    }
    async get_server_by_id(server_id){
        return this.serverlist[server_id]
    }
    async remove_server_by_id(server_id){
        let server = await this.get_server_by_id(server_id)
        if(!server){
            return
        }
        delete this.serverlist[server_id]
        await this.save_serverlist()
    }
    async test_server_update_validity(mod_info,attachment_metadata){
        //TODO here we should authenticate the sender of the server information update,
        return 'valid'
    }
    async add_server(request_body){
        try{
            let advertisement = request_body.advertisement
            let server_id = this.make_up_server_id(advertisement)
            console.log("updating server details",server_id)
            let new_server = {
                details:{
                    name:advertisement.name,
                    description:advertisement.description,
                    tags:advertisement.tags,
                    address:advertisement.address,
                    data:advertisement.data,
                },
                last_alive_ts:Date.now()
            }
            if(request_body.icon_data){
                let icon_data_processessed = Buffer.from(request_body.icon_data, 'base64') 
                await write_image_data_to_file(server_images_folder,server_id,"png",icon_data_processessed)
            }
            this.serverlist[server_id] = new_server
            await this.save_serverlist()
            this.has_changed_since_last_get_all = true
            return 'added'
        }catch(e){
            console.error("failed to add server")
            return 'failed'
        }
    }
}

let serverlist = new Serverlist()
module.exports = serverlist