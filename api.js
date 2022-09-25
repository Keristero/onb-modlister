const express = require('express')
const cors = require('cors')
const app = express()
const modlist = require('./modlist.js')
const {PORT,ALLOWED_ORIGINS} = require('./environment.js')

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

app.use(cors((req,callback)=>{
    //configure cors options based on each request's origin
    let requesting_origin = req.header('Origin')
    let cors_options = {origin: false}
    if(ALLOWED_ORIGINS.includes(requesting_origin)) {
        cors_options.origin = true
        console.log(`DEBUG, allowed request from ${requesting_origin}`)
    }else{
        console.log(`DEBUG, rejected request from ${requesting_origin}`)
    }
    callback(null, cors_options)
}))

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
console.log(`api hosted on http://localhost:${PORT}`)