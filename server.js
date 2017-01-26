/*
    The full Xirsys Api uses PUT/POST/GET and DELETE to provide a more granular api
    however, in this context, just GETting is simpler.
*/


var request = require("request")
var express = require("express")
var https = require('https')
var http = require('http')
var url = require('url')

var STEM = process.env.XIRSYS_API

if (!STEM) {
    console.log('Please set XIRSYS_API="https://ident:secret@xirsys_gateway"')
    process.exit(1)
}

var stem = url.parse(STEM)

var app = express()
var server;

if (stem.protocol == "https") {
    var opts = {
        key: fs.readFileSync(path.join(__dirname, 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'server.crt'))
    };
    server = https.createServer(opts, app).listen(8000)
} else {
    server = http.createServer(app).listen(8000)
}


app.use(express.static('./public'));


//Returns Secure token to connect to the service.
app.post('/signal/token', function(req, res) {
    console.log(req)
    request.put({ url: STEM + "/_token/my/ns", json: true }).pipe(res)
})

//Returns List of valid signaling servers that the clients can connect to.
app.get('/signal/list', function(req, res) {
    request.get({ url: STEM + "/_host?type=signal", json: true }).pipe(res)
})

//Returns a Valid ICE server setup to handle the WebRTC handshake and TURN connection if needed.
app.get('/ice', function(req, res) {
    request.put({ url: STEM + "/_turn/my/ns", json: true }).pipe(res)
});


app.get('/xirsys_connect.js', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
    var xirsysConnect = {
        secureTokenRetrieval: true,
        server: '',
        data: {
            domain: 'my',
            application: 'default',
            room: 'default',
            secure: 0
        }
    }

    var xirsys = {
        baseUrl: "http://localhost:8000/",
        class: {}
    }

    var xc = "var xirsysConnect=" + JSON.stringify(xirsysConnect) + ";\n"
    var xs = "var $xirsys=" + JSON.stringify(xirsys) + ";\n"
    res.end(xc + xs)
});