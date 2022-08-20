const path = require('path')
const { readdir, copyFile, mkdir,rm,stat} = require('fs/promises')
const { exec } = require('child_process')

const game_client_folder = path.join('.', 'game-client', 'Release')

async function clear_client_mods() {
    const mod_folders = ["blocks", "cards", "enemies", "libs", "players"]
    for (let sub_folder of mod_folders) {
        let mod_folder_path = path.join(game_client_folder,'resources','mods', sub_folder)
        let files = await readdir(mod_folder_path)
        for (let file of files) {
            let file_path = path.join(mod_folder_path, file)
            await rm(file_path,{ recursive: true, force: true })
        }
    }
}

// unused
/*
async function ensure_dir_exists(filePath) {
    var dirname = path.dirname(filePath);
    try{
        let res = await stat(dirname)
        if (res.isDirectory()) {
            return true;
        }
    }catch(e){
    }
    await mkdir(dirname)
    return true
} */

async function zip_and_hash_package(attachment_path, mod_info) {
    console.log('clearing client mods')
    await clear_client_mods()
    let package_path = path.join(game_client_folder, 'resources', 'mods', mod_info.type, 'package.zip')
    console.log('copying ',attachment_path,' attachment to ', package_path)
    await copyFile(attachment_path, package_path)
    let hash_result = await launch_client_zip_and_hash()
    console.log('hash result',hash_result)
    if(hash_result){
        let zipped_path = package_path
        console.log('copying client zipped mod from',zipped_path)
        await copyFile(zipped_path,attachment_path)
        console.log('overwrote original package zip with client zipped package')
        return hash_result
    }
    return null
}

function launch_client_zip_and_hash() {
    return new Promise((resolve, _reject) => {
        let launch_command = `BattleNetwork.exe -i`
        let hash_and_package_regex = /([a-z0-9]{32} .*)$/gm
        exec(launch_command,{cwd:game_client_folder},(error, stdout, _stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            let result = stdout.match(hash_and_package_regex)
            if(result){
                let last_match = result.pop().split(' ')
                let output = {hash:last_match[0],package_id:last_match[1]}
                resolve(output)
            }
            resolve(null)
        });
    })

}

module.exports = {zip_and_hash_package}