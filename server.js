/*
   This is a straight-through proxy, to the V2 legacy api on the V3 system. This
   example is driven via the V2 client SDK - as such it elaborates none of the new V3 features.
*/

var request = require("request")
var express = require("express")
var https = require('https')
var http = require('http')
var url = require('url')
var fs = require('fs')
var stripe = require('stripe')

var bodyParser = require('body-parser');

const NEURON = process.env.NEURON_PORT_4006_TCP_ADDR
const PORT=4007

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./public'));


function service(method,service,path,data,cb) {
    request({
        method: method.toUpperCase(),
        url: `http://${NEURON}:4006/${service}${path}`,
        json: true, 
        form: data
    },cb)
}


http.createServer(app).listen(PORT)


//Returns Secure token to connect to the service.
app.post('/deposit', function(req, res) {
   service("GET","_acc","/accounts",{k: "demouser"},(err,status) => {
        if (status.s == "ok") {
            res.json(status.v)
        } else {
            res.json(status)
        }
   })
})
