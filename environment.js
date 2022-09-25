const environment = {
    DISCORD_TOKEN:String(process.env.DISCORD_TOKEN || ``),
    MODS_CHANNEL_ID:String(process.env.MODS_CHANNEL_ID || ``),
    SKINS_CHANNEL_ID:String(process.env.SKINS_CHANNEL_ID || ``),
    PORT:String(process.env.PORT || 80),
    ALLOWED_ORIGINS:String(process.env.ALLOWED_ORIGINS.split(',') || []),
}

module.exports = environment