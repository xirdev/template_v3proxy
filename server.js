/*
    The full Xirsys Api uses PUT/POST/GET and DELETE to provide a more granular api
    however, in this context, just GETting is simpler.
*/

var request = require("request")
var express = require("express")
var https = require('https')
var http = require('http')
var url = require('url')
var fs = require('fs')
var bodyParser = require('body-parser');


if (!fs.existsSync("config.json")) {
    console.log("Please provide config.json")
    process.exit(1)
}

var XS = JSON.parse(fs.readFileSync("config.json"))

var app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var server;

if (XS.protocol == "https") {
    var opts = {
        key: fs.readFileSync(path.join(__dirname, 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'server.crt'))
    };
    server = https.createServer(opts, app).listen(8000)
} else {
    server = http.createServer(app).listen(8000)
}


app.use(express.static('./public'));

var gw = XS.protocol + "://" + XS.gateway

//Returns Secure token to connect to the service.
app.post('/signal/token', function(req, res) {
    body = req.body
    body["ident"] = XS.ident
    body["secret"] = XS.secret
    request.post(gw + "/signal/token", { form: body }).pipe(res)
})


//Returns List of valid signaling servers that the clients can connect to.
app.get('/signal/list', function(req, res) {
    request.get({ url: gw + "/signal/list", json: true }).pipe(res)
})


//Returns a Valid ICE server setup to handle the WebRTC handshake and TURN connection if needed.
app.get('/ice', function(req, res) {
    request.put({ url: gw + "/_turn/my/ns", json: true }).auth(XS.ident, XS.secret).pipe(res)
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

    // var xirsys = {
    //     baseUrl: "http://localhost:8000/",
    //     class: {}
    // }

    var xc = "var xirsysConnect=" + JSON.stringify(xirsysConnect) + ";\n"
        // var xs = "var $xirsys=" + JSON.stringify(xirsys) + ";\n"
    res.end(xc)
});