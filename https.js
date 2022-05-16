const os = require('os')
const fs = require('fs')
const https = require('https')
const wall = require('./script/wall')
const google = require('./script/google')

var https_key = 'private.key'
var https_cert = 'certificate.crt'

var tick = 0

if(os.platform() == 'win32')
{
    https_key = '127.0.0.1.key'
    https_cert = '127.0.0.1.cert'
}

const options = {
    key: fs.readFileSync('res/'+https_key),
    cert: fs.readFileSync('res/'+https_cert)
}

wall.init()

https.createServer(options,(req,res)=>{
    ++tick
    new google(req.url,req.headers.referer,res,tick)
}).listen(443)
