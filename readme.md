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

1. 
1. let users select multiple mods to download, send a .zip with the correct folder structure containing the selected mods
1. add radio buttons for selecting mod types to display
1. add search for many fields