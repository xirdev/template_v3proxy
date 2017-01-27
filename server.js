/*
   This is a straight-through proxy, to the V2 legacy api on the V3 system, as this
   example is driven via the V2 confDK, as such it elaborates none of the new V3 features.
*/

var request = require("request")
var express = require("express")
var https = require('https')
var http = require('http')
var url = require('url')
var fs = require('fs')
var bodyParser = require('body-parser');

config_file = process.argv[2]

if (!config_file) {
    console.log("Please provide config file name as argument")
    process.exit(1)
}

if (!fs.existsSync(config_file)) {
    console.log(config_file + " does not exist")
    process.exit(1)
}

var conf = JSON.parse(fs.readFileSync(config_file))

var app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var server;

if (conf.protocol == "https") {
    var opts = {
        key: fs.readFileSync(conf.key_file),
        cert: fs.readFileSync(conf.cert_file)
    };
    server = https.createServer(opts, app).listen(conf.port)
} else {
    server = http.createServer(app).listen(conf.port)
}


app.use(express.static('./public'));


function get_gateway() {
    if (conf.gateway == "NEURON")
        process.env.NEURON + ":4003"
    else
        conf.gateway
}

var gw = conf.protocol + "://" + get_gateway()

//Returns Secure token to connect to the service.
app.post('/signal/token', function(req, res) {
    body = req.body
    body["ident"] = conf.ident
    body["secret"] = conf.secret
    request.post(gw + "/signal/token", { form: body }).pipe(res)
})


//Returns List of valid signaling servers that the clients can connect to.
app.get('/signal/list', function(req, res) {
    request.get({ url: gw + "/signal/list", json: true }).pipe(res)
})


//Returns a Valid ICE server setup to handle the WebRTC handshake and TURN connection if needed.
app.post('/ice', function(req, res) {
    request.post({ url: gw + "/ice", json: true, form: req.body }).pipe(res)
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
            secure: (conf.protocol == "https") ? 1 : 0
        }
    }

    var xc = "var xirsysConnect=" + JSON.stringify(xirsysConnect) + ";\n"

    res.end(xc)
});