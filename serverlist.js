const {open_json,save_to_json,sanitize_string,AsyncLock,write_image_data_to_file} = require('./helpers.js')
const serverlist_json_path = `./serverlist.json`
const server_images_folder = `./server_images/`
const crypto = require('crypto');

const ephemerial_fields = ["online_players","player_maps"]
const persisted_fields = ["name","description","tags","address","data","color","map"]
//deprecated fields (online_players)

const json_lock = new AsyncLock()
class Serverlist{
    constructor(){
        this.has_changed_since_last_get_all = true
        let one_hour = 1000*60*60
        setInterval(async()=>{
            for(let server_id in this.serverlist.details){
                let last_alive_ts = this.serverlist.details[server_id].last_alive_ts
                if(!last_alive_ts){
                    continue
                }
                //if a server has not been up for more than 7 days delete it
                if(Date.now() - last_alive_ts > one_hour*7*24){
                    await this.remove_server_by_id(server_id)
                }
            }
        },one_hour)
    }
    make_up_server_id(advertisement){
        return sanitize_string(`${advertisement.address}-${advertisement.data}`)
    }
    async load_serverlist(){
        await json_lock.promise
        json_lock.enable()
        this.serverlist = await open_json(serverlist_json_path)
        if(!this.serverlist.secret_keys){
            this.serverlist.secret_keys = {}
        }
        if(!this.serverlist.details){
            this.serverlist.details = {}
        }
        json_lock.disable()
        console.log(`loaded server list ${Object.keys(this.serverlist.details).length} servers`)
        this.has_changed_since_last_get_all = true
    }
    get_all(){
        this.has_changed_since_last_get_all = false
        return this.serverlist.details
    }
    async save_serverlist(){
        await json_lock.promise
        json_lock.enable()
        await save_to_json(serverlist_json_path,this.serverlist)
        json_lock.disable()
    }
    async get_server_by_id(server_id){
        return this.serverlist.details[server_id]
    }
    async remove_server_by_id(server_id){
        let server = await this.get_server_by_id(server_id)
        if(!server){
            return
        }
        delete this.serverlist.details[server_id]
        delete this.serverlist.secret_keys[server_id]
        await this.save_serverlist()
    }
    async test_server_update_validity(mod_info,attachment_metadata){
        //TODO here we should authenticate the sender of the server information update,
        return 'valid'
    }
    async update_server(request_body){
        try{
            let unique_server_id = request_body?.server_id
            if(!unique_server_id){
                return {status:'no unique id provided',changed_values:{}}
            }
            unique_server_id = sanitize_string(unique_server_id)

            let secret_key = request_body?.secret_key
            let server_secret_key = this.serverlist.secret_keys[unique_server_id]
            let server_already_added = server_secret_key != null && server_secret_key != undefined
            if(server_already_added && server_secret_key != secret_key){
                return {status:'invalid secret provided',changed_values:{}}
            }

            let server_details = {}
            let should_write_to_disk = false
            for(let field_name in request_body.fields){
                if(persisted_fields.includes(field_name)){
                    should_write_to_disk = true
                    server_details[field_name] = request_body.fields[field_name]
                }
                if(ephemerial_fields.includes(field_name)){
                    server_details[field_name] = request_body.fields[field_name]
                }
            }
            server_details.last_alive_ts = Date.now()

            if(request_body.fields.b64_image){
                let icon_data_processessed = Buffer.from(request_body.fields.b64_image, 'base64') 
                await write_image_data_to_file(server_images_folder,unique_server_id,"png",icon_data_processessed)
            }
            if(!server_already_added){
                should_write_to_disk = true
                server_secret_key = crypto.randomUUID()
                this.serverlist.secret_keys[unique_server_id] = server_secret_key
            }
            if(!this.serverlist.details[unique_server_id]){
                this.serverlist.details[unique_server_id] = {}
            }
            for(let field_name in server_details){
                this.serverlist.details[unique_server_id][field_name] = server_details[field_name]
            }
            if(should_write_to_disk){
                await this.save_serverlist()
            }
            this.has_changed_since_last_get_all = true
            if(server_already_added){
                return {status:'updated',changed_values:{[unique_server_id]:server_details}}
            }else{
                return {status:`secretkey=${server_secret_key}`,changed_values:{[unique_server_id]:server_details}}
            }
        }catch(e){
            console.error("failed to add server",e)
            return {status:'failed',changed_values:{}}
        }
    }
}

let serverlist = new Serverlist()
module.exports = serverlist