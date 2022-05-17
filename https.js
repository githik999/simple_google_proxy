const os = require('os')
const fs = require('fs')
const https = require('https')
const wall = require('./script/wall')
const google = require('./script/google')

let ca = 'lookssl'

if(os.platform() == 'win32')
{
    ca = 'localhost'
}

const options = {
    key: fs.readFileSync('res/'+ca+'.key'),
    cert: fs.readFileSync('res/'+ca+'.crt')
}

wall.init()

https.createServer(options,(req,res)=>{
    new google(req.url,req.headers.referer,res)
}).listen(443)
