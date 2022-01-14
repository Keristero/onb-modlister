const express = require('express')
const app = express()
const modlist = require('./modlist.js')
const {PORT} = require('./environment.js')

const cache_static_options = {
    etag: true,
    index: false,
    maxAge: '1d',
}

app.use(express.static('web_static'))
app.use('/images', express.static('images',cache_static_options))
app.use('/mods', express.static('mods',cache_static_options))

app.get('/mod_list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(modlist.get_all()));
})

app.listen(PORT)
console.log(`webserver hosted on http://localhost:${PORT}`)