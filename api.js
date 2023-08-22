const express = require('express')
const cors = require('cors')
const app = express()
const modlist = require('./modlist.js')
const {PORT,ALLOWED_ORIGINS} = require('./environment.js')
const {WebSocketServer,WebSocket} = require('ws')
const serverlist = require('./serverlist.js')

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
    let cors_options = {origin: false}//set to false in production!
    console.log(req.url,req.method)
    //We allow posts for server advertisement from anywhere
    let is_server_advertisement = req.url == "/server_list/" && req.method == "POST"
    if(ALLOWED_ORIGINS.includes(requesting_origin) || is_server_advertisement) {
        cors_options.origin = true
        console.log(`DEBUG, allowed request from ${requesting_origin}`)
    }else{
        console.log(`DEBUG, rejected request from ${requesting_origin}`)
    }
    callback(null, cors_options)
}))

//test server for running with express
app.use(express.static('./onb-modsite'))


app.use('/images', express.static('images',cache_images_options))
app.use('/server_images', express.static('server_images',cache_images_options))
app.use('/mods', express.static('mods',cache_mods_options))

app.use(express.json());

app.post('/server_list', async function (req, res) {
    console.log('server_list request body',req.body)
    let {status,changed_values} = await serverlist.update_server(req.body)
    if(Object.keys(changed_values).length > 0){
        websocket_broadcast(changed_values)
    }
    console.log('status=',status)
    res.status(200);
    let response_data = {detail:status}
    if(status.includes("secretkey")){
        response_data.secret_key = status.split("=")[1]
    }
    if(status == "failed"){
        res.status(400);
    }
    console.log('sending response',response_data)
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response_data));
})

app.get('/server_list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(serverlist.get_all()));
})

app.get('/mod_list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(modlist.get_all()));
})

app.get('/mod_whitelist',function(req,res){
    res.setHeader('Content-Type', 'text/plain');
    res.end(modlist.get_all_whitelist());
})

const server = app.listen(PORT)
//for websockets
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', socket => {
  socket.on('message', message => console.log(message));
});
function websocket_broadcast(changed_values){
    for(let client of wss.clients){
        if (client && client?.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(changed_values), { binary: false });
        }
    }
}
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});
console.log(`api hosted on http://localhost:${PORT}`)