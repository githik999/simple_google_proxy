const os = require('os')
const fs = require('fs')
const https = require('https')
const china = require('./china')
const google = require('./google')

var https_key = 'private.key'
var https_cert = 'certificate.crt'

if(os.platform() == 'win32')
{
    https_key = '127.0.0.1.key'
    https_cert = '127.0.0.1.cert'
}

const options = {
    key: fs.readFileSync(https_key),
    cert: fs.readFileSync(https_cert)
}

china.init()

https.createServer(options,(req,res)=>{
    new google(req.url,res)
}).listen(443)
