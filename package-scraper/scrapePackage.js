const JSZip = require("jszip");
const { LuaFactory } = require("wasmoon");
const { normalize: normalizePath } = require("path");

const luaFactory = new LuaFactory();

// can "throw", make sure to .catch()/try catch
async function scrapePackage(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);

  const packageInfo = await getPackageInfo(
    await zip.file("entry.lua").async("string")
  );

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

async function getPackageInfo(entryLua) {
  const DEFAULT_PACKAGE_TYPE = "lib";
  const packageInfo = {
    type: DEFAULT_PACKAGE_TYPE, // "blocks" | "card" | "encounter" | "lib" | "player"
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
      // card, encounter, and player properties
      preview, // string -> uint8array
      */
    },
  };

  // Create a standalone lua environment from the factory
  const lua = await luaFactory.createEngine();

  try {
    implementSupportingAPI(lua);

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

      // subpackages
      define_character: (id, path) => {
        packageInfo.subpackages.push(id);
      },
      define_card: (id, path) => {
        packageInfo.subpackages.push(id);
      },
      define_library: (id, path) => {
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

      // cards
      set_codes: (codes) => {
        packageInfo.type = "card";
        packageInfo.detail.codes = codes;
      },
      get_card_props: () => {
        packageInfo.type = "card";
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
        packageInfo.type = "player";
        packageInfo.description = description;
      },
      set_overworld_animation_path: () => {
        packageInfo.type = "player";
      },
      set_overworld_texture_path: () => {
        packageInfo.type = "player";
      },
      set_mugshot_texture_path: () => {
        packageInfo.type = "player";
      },
      set_mugshot_animation_path: () => {
        packageInfo.type = "player";
      },

      // cards, encounters, and players
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

      // encounters + players
      set_speed: () => {},
      set_attack: () => {},
      set_health: () => {},
      set_charged_attack: () => {},
    };

    // load
    await lua.doString(entryLua);

    // call package_* functions
    const package_requires_scripts = lua.global.get("package_requires_scripts");
    package_requires_scripts?.(package_arg);

    const package_init = lua.global.get("package_init");
    package_init(package_arg);

    if (
      packageInfo.type == DEFAULT_PACKAGE_TYPE &&
      lua.global.get("package_build")
    ) {
      packageInfo.type = "encounter";
    }
  } finally {
    // Close the lua environment, so it can be freed
    lua.global.close();
  }

  return packageInfo;
}

function implementSupportingAPI(lua) {
  lua.global.set("_modpath", "");
  lua.global.set("_folderpath", "");

  lua.global.set("include",(include_path)=>{
    console.log('lua tried including',include_path)
    let require_file = lua.global.get("require");
    return require_file?.(include_path);
  })

  lua.global.set("Engine", {
    load_texture: (path) => path,
    load_audio: (path) => path,
  });

  lua.global.set("Color", {
    new: function (r, g, b, a) {
      return { r, g, b, a };
    },
  });

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


module.exports = {
  scrapePackage,
};
