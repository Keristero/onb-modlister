const { access } = require('fs/promises')
const { constants } = require('fs')
const { readFile, writeFile } = require('fs/promises')
const {join} = require('path')

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

function sanitize_string(input_string){
    return input_string.replace(/[^a-z0-9/]/gi, '_')
}

async function write_image_data_to_file(folder_path,file_name,extension,image_data){
    let safe_filename = sanitize_string(file_name)
    let file_path = `${join(folder_path,safe_filename)}.${extension}`
    await writeFile(file_path,image_data)
    return file_path
}

async function save_to_json(json_path,data){
    let empty_json_string = JSON.stringify(data)
    await writeFile(json_path,empty_json_string)
}

module.exports = {file_exists,open_json,save_to_json,write_image_data_to_file,sanitize_string}