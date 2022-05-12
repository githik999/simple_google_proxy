const http = require('http')
const google = require('./google')

function onRequest(req,res)
{
    if(req.url == '/')
    {
        google.index(res)
    }
    else
    {
        google.local(req.url,res)
    }
}

const server = http.createServer()
server.on('request',onRequest)
server.listen(80)
