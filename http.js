const http = require('http')
const google = require('./google')

function onRequest(req,res)
{
    google.EE.on('job_done',(body)=>{
        res.end(body)
    })

    if(req.url == '/')
    {
        google.index()
    }
    else
    {
        google.local(req.url)
    }
}

const server = http.createServer()
server.on('request',onRequest)
server.listen(80)
