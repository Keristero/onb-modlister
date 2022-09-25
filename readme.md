# about
The modlister maintains a list of all ONB mods from the ONB discord server #mods channel.

ONB-Modlister consists of a discord bot, package scraper and api
when you add a mod to a thread in the mods channel - the bot will check it out and react to it
✅ means the bot was able to parse the mod and the mod will be displayed on the list
❌ means the bot was unable to parse the mod, this could be due to many reasons
- lua errors in your code
- not uploading the .zip generated in the mods folder when the client starts
- the mod lister is being dumb
📁  reaction = the bot has parsed this again and knows it is older, you wont see this much because the bot does not reprocess old zips usually
🔒  reaction = the mod wont be replaced in the list because you are not the author who uploaded the original (based on discord id)

# troubleshooting
If you get an error about DISALLOWED_INTENTS you need to configure your bot application to use intents
https://discord.com/developers/applications
in particular, enable `MESSAGE CONTENT INTENT` under Privileged Gateway Intents

# Todo

1. add alphabetical search
1. scrape using .json definitions from the OBN docs, this will allow scraping of navi names and more ;)
1. add private messaging with feedback for mod uploads
1. scrape thread tags, and add tags based on code
    1. scrape game / custom EXE6 etc ✅
    1. add music tag to music mods