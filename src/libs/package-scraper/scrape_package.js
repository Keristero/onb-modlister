const JSZip = require("jszip");
const { LuaFactory } = require("wasmoon");
const { normalize: normalizePath, dirname, normalize } = require("path");
const {readFile} = require('fs/promises')
const {parentPort, workerData} = require('worker_threads');

const max_memory = 1000000
const banned_libs = ['io', 'os', 'coroutine', 'string', 'utf8', 'debug', 'package']

const luaFactory = new LuaFactory();

let preloaded_lua_files = {}
let current_path = ""

main()

async function main() {
    let zip_path = workerData
    let data = await readFile(zip_path)
    let mod_info = await scrapePackage(data)
    parentPort.postMessage(mod_info);
}

async function load_zip_and_luafiles(zip) {
    //preload all the lua files in the zip, because we need instant access to them
    for (let relativePath in zip.files) {
        let file = zip.files[relativePath]
        console.log("iterating over", relativePath);
        if (file.name.match(/.lua$/gmi)) {
            //attach dirname, and preloaded text to the file object for later
            let directory = `${dirname(relativePath)}/`
            let preloaded_text = await zip.file(relativePath).async("string")
            let normalized_name = normalize(file.name)
            preloaded_lua_files[normalized_name] = {
                relativePath: relativePath,
                directory: directory,
                preloaded_text: preloaded_text,
                fileName: normalized_name
            }
            console.log(`loaded lua file ${relativePath}`)
        }
    }
}

function update_path_and_run_lua(lua, preloaded_lua, is_entry) {
    current_path = preloaded_lua.directory
    let modded_text = `_export = (function()\nlocal _folderpath = "${current_path}"\nlocal function include(path)\nreturn _ENV.include(_folderpath..path)\nend\n${preloaded_lua.preloaded_text}\nend)()\n`
    if (is_entry) {
        modded_text = `local _folderpath = "${current_path}"\nlocal function include(path)\nreturn _ENV.include(_folderpath..path)\nend\n${preloaded_lua.preloaded_text}`
    }
    console.log(`running lua ${preloaded_lua.fileName}`)
    console.log(`setting _folderpath to ${current_path}`)
    //console.log(modded_text)
    lua.doStringSync(modded_text)
    let result = lua.global.get("_export")
    console.log(`finished running lua ${preloaded_lua.fileName}`)
    return result
}

// can "throw", make sure to .catch()/try catch
async function scrapePackage(zipFile) {
    preloaded_lua_files = {}
    current_path = ""
    const zip = await JSZip.loadAsync(zipFile);
    await load_zip_and_luafiles(zip)

    const packageInfo = await getPackageInfo(preloaded_lua_files['entry.lua']);

    const extractImage = async function (path) {
        if (!path || path == "") {
            return undefined;
        }

        path = normalizePath(path).replaceAll("\\", "/");

        try {
            return await zip.file(path).async("uint8array");
        } catch (err) {
            // error?, ok might be a mod issue not ours
            console.log('Failed to extract "' + path + '" reason: ' + err);
            return undefined;
        }
    };

    if (packageInfo.detail.icon) {
        packageInfo.detail.icon = await extractImage(packageInfo.detail.icon);
    }

    if (packageInfo.detail.preview) {
        packageInfo.detail.preview = await extractImage(packageInfo.detail.preview);
    }

    return packageInfo;
}

async function getPackageInfo(entry_file) {
    const DEFAULT_PACKAGE_TYPE = "libs";
    const packageInfo = {
        type: DEFAULT_PACKAGE_TYPE, // "blocks" | "cards" | "enemies" | "libs" | "players"
        id: undefined, // string
        dependencies: [],
        subpackages: [],
        name: "",
        detail: {
            /*
            // blocks properties
            color, // "White" | "Red" | "Green" | "Blue" | "Pink" | "Yellow"
            shape,
            // card properties
            codes, // string[]
            props,
            // card + player properties
            icon, // string -> uint8array
            // card, enemies, and player properties
            preview, // string -> uint8array
            */
        },
    };

    // Create a standalone lua environment from the factory
    const lua = await luaFactory.createEngine({ traceAllocations: true });

    try {
        disableScaryThings(lua)
        implementSupportingAPI(lua, packageInfo);

        const package_arg = {
            declare_package_id: (id) => {
                packageInfo.id = id;
            },
            set_name: (name) => {
                packageInfo.name = name;
            },
            set_description: (description) => {
                packageInfo.description = description;
            },

            // subpackages
            define_card: (id) => {
                packageInfo.subpackages.push(id);
            },
            define_library: (id) => {
                packageInfo.subpackages.push(id);
            },

            // blocks
            set_color: (color) => {
                packageInfo.type = "blocks";
                packageInfo.detail.color = color;
            },
            set_shape: (shape) => {
                packageInfo.type = "blocks";
                packageInfo.detail.shape = shape;
            },
            set_mutator: () => {
                packageInfo.type = "blocks";
            },
            as_program: () => {
                packageInfo.type = "blocks";
                packageInfo.detail.is_program = true;
            },

            // cards
            set_codes: (codes) => {
                packageInfo.type = "cards";
                packageInfo.detail.codes = codes;
            },
            get_card_props: () => {
                packageInfo.type = "cards";
                if (!packageInfo.detail.props) {
                    packageInfo.detail.props = {
                        can_boost: true,
                    };
                }

                // looks like wasmoon does take this as a reference as we need
                return packageInfo.detail.props;
            },

            // players
            set_special_description: (description) => {
                packageInfo.type = "players";
                packageInfo.description = description;
            },
            set_overworld_animation_path: () => {
                packageInfo.type = "players";
            },
            set_overworld_texture_path: () => {
                packageInfo.type = "players";
            },
            set_mugshot_texture_path: () => {
                packageInfo.type = "players";
            },
            set_mugshot_animation_path: () => {
                packageInfo.type = "players";
            },
            set_emotions_texture_path: () => { },

            // cards, enemies, and players
            set_preview_texture: (path) => {
                packageInfo.detail.preview = path;
            },
            set_preview_texture_path: (path) => {
                packageInfo.detail.preview = path;
            },

            // cards + players
            set_icon_texture: (path) => {
                packageInfo.detail.icon = path;
            },

            // enemies + players
            set_speed: () => { },
            set_attack: () => { },
            set_health: () => { },
            set_charged_attack: () => { },
        };

        // load
        update_path_and_run_lua(lua, entry_file, true)

        // call package_* functions
        const package_requires_scripts = lua.global.get("package_requires_scripts");
        package_requires_scripts?.(package_arg);

        const package_init = lua.global.get("package_init");
        package_init(package_arg);

        if (
            packageInfo.type == DEFAULT_PACKAGE_TYPE &&
            lua.global.get("package_build")
        ) {
            packageInfo.type = "enemies";
        }
    } finally {
        // Close the lua environment, so it can be freed
        lua.global.close();
    }

    return packageInfo;
}

function implementSupportingAPI(lua, packageInfo) {
    lua.global.set("_modpath", "./");
    lua.global.set("_folderpath", "./");

    lua.global.set("make_frame_data", () => {
        return {}
    })

    lua.global.set("include", (include_path) => {
        if (include_path[0] == "/") {
            include_path = include_path.substr(1, include_path.length)
        }
        console.log('lua tried including', include_path)
        include_path = normalizePath(include_path)
        console.log('path normalized to', include_path)
        const file = preloaded_lua_files[include_path]

        if (!file) {
            throw (`unable to find lua in zip at path ${include_path}`)
        }
        console.log(`running lua from zip path ${include_path}`)
        return update_path_and_run_lua(lua, file, false)
    })

    lua.global.set("Engine", {
        load_texture: (path) => path,
        load_audio: (path) => path,
        define_character: (id) => {
            packageInfo.subpackages.push(id);
        },
        // dependencies
        requires_character: (id) => {
            packageInfo.dependencies.push(id);
        },
        requires_card: (id) => {
            packageInfo.dependencies.push(id);
        },
        requires_library: (id) => {
            packageInfo.dependencies.push(id);
        },
    });

    lua.global.set("Color", {
        new: function (r, g, b, a) {
            return { r, g, b, a };
        },
    });

    lua.global.set("TileState",{
        Normal:0,
        Cracked:1,
        Broken:2,
        DirectionUp:11,
        DirectionDown:12,
        DirectionLeft:9,
        DirectionRight:10,
        Empty:7,
        Grass:4,
        Hidden:14,
        Holy:8,
        Ice:3,
        Lava:5,
        Poison:6,
        Volcano:13
    })

    lua.global.set("Hit",{
        None:0,
        Flinch:1,
        Flash:2,
        Stun:3,
        Root:4,
        Impact:5,
        Shake:6,
        Pierce:7,
        Retangible:8,
        Breaking:9,
        Bubble:10,
        Freeze:11,
        Drag:12
    })

    lua.global.set("Blocks", {
        White: "White",
        Red: "Red",
        Green: "Green",
        Blue: "Blue",
        Pink: "Pink",
        Yellow: "Yellow",
    });

    lua.global.set("Element", {
        Fire: "Fire",
        Aqua: "Aqua",
        Elec: "Elec",
        Wood: "Wood",
        Sword: "Sword",
        Wind: "Wind",
        Cursor: "Cursor",
        Summon: "Summon",
        Plus: "Plus",
        Break: "Break",
        None: "None",
    });

    lua.global.set("CardClass", {
        Standard: "Standard",
        Mega: "Mega",
        Giga: "Giga",
        Dark: "Dark",
    });
}

function disableScaryThings(lua) {
    lua.global.setMemoryMax(max_memory)
    console.log(`memory used`, lua.global.getMemoryUsed(), `/`, lua.global.getMemoryMax())

    for (let lib_name of banned_libs) {
        lua.global.set(lib_name, "")
    }

    lua.global.set("require", "")
    lua.global.set("dofile", "")
    lua.global.set("loadfile", "")
    lua.global.set("loadstring", "")
    lua.global.set("load", "")
}