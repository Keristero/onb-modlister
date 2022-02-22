const express = require('express')
const app = express()
const modlist = require('./modlist.js')
const {PORT} = require('./environment.js')

const cache_images_options = {
    etag: true,
    index: false,
    maxAge: '1d',
}

const cache_mods_options = {
    etag: true,
    index: false,
    maxAge: '30d',
}

app.use(express.static('web_static'))
app.use('/images', express.static('images',cache_images_options))
app.use('/mods', express.static('mods',cache_mods_options))

app.get('/mod_list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(modlist.get_all()));
})

app.get('/mod_whitelist',function(req,res){
    res.setHeader('Content-Type', 'text/plain');
    res.end(modlist.get_all_whitelist());
})

app.listen(PORT)
console.log(`webserver hosted on http://localhost:${PORT}`)