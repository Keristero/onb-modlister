const express = require('express')
const app = express()
const modlist = require('./modlist.js')

app.use(express.static('web_static'))
app.use('/images', express.static('images'))
app.use('/mods', express.static('mods'))

app.get('/mod_list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(modlist.get_all()));
})

app.listen(80)
console.log(`webserver hosted on http://localhost:80`)