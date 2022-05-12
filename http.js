const http = require('http')
const google = require('./google')

function onRequest(req,res)
{
    let url = req.url
    if(url.indexOf('search') == 1)
    {
        google.search(url,res)
    }
    else if(req.url == '/')
    {
        google.index(res)
    }
    else
    {
        google.local(url,res)
    }
}

const server = http.createServer()
server.on('request',onRequest)
server.listen(80)
