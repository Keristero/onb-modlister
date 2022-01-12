const { access } = require('fs/promises')
const { constants } = require('fs')
const { readFile, writeFile } = require('fs/promises')

async function file_exists(file_path) {
    try {
        await access(file_path, constants.R_OK | constants.W_OK)
        return true
    } catch {
        return false
    }
}

async function open_json(json_path){
    let exists = await file_exists(json_path)
    if(!exists){
        await save_to_json(json_path,{})
    }
    let rawdata = await readFile(json_path)
    let obj = JSON.parse(rawdata)
    return obj
}

async function save_to_json(json_path,data){
    let empty_json_string = JSON.stringify(data)
    await writeFile(json_path,empty_json_string)
}

module.exports = {file_exists,open_json,save_to_json}