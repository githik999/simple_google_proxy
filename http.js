const http = require('http')
const google = require('./google.js')

function onRequest(req,res)
{
    new google(req.url,res)
}

http.createServer(onRequest).listen(80)