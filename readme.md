# about
The modlister maintains a list of all ONB mods from the ONB discord server #mods channel.

ONB-Modlister consists of a discord bot, package scraper and web interface.
when you add a mod to a thread in the mods channel - the bot will check it out and react to it
✅ means the bot was able to parse the mod and the mod will be displayed on the list
❌ means the bot was unable to parse the mod, this could be due to many reasons
- lua errors in your code
- not uploading the .zip generated in the mods folder when the client starts
- the mod lister is being dumb
📁  reaction = the bot has parsed this again and knows it is older, you wont see this much because the bot does not reprocess old zips usually
🔒  reaction = the mod wont be replaced in the list because you are not the author who uploaded the original (based on discord id)

# Todo

1. add hover style ✅
1. display codes and elements ✅
1. display mod details on right click, including link to discord thread ✅
1. display damage ✅
1. add rezipping and hash recording ✅
1. scrape skins from the skins channel ✅
1. add alphabetical search
1. scrape using .json definitions from the OBN docs, this will allow scraping of navi names and more ;)
1. add query params and page history, allows you to share a link with a filter+sort option prefilled.
1. add private messaging with feedback for mod uploads
1. scrape thread tags, and add tags based on code
    1. scrape game / custom EXE6 etc
    1. add music tag to music mods