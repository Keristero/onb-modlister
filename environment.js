const environment = {
    DISCORD_TOKEN:String(process.env.DISCORD_TOKEN || ``),
    MODS_CHANNEL_ID:String(process.env.MODS_CHANNEL_ID || ``),
    SKINS_CHANNEL_ID:String(process.env.SKINS_CHANNEL_ID || ``),
    PORT:String(process.env.PORT || 80),
    ALLOWED_ORIGINS:String(process.env.ALLOWED_ORIGINS.split(',') || []),
    SSL_KEY:String(processs.env.SSL_KEY || ``),
    SSL_CERT:String(process.env.SSL_CERT || ``),
    USE_HTTPS:Boolean(process.env.USE_HTTPS || false)
}

module.exports = environment
