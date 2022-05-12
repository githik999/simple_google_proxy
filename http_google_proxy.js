const http = require('http')
const google = require('./google')

function onRequest(req,res)
{
    console.log(req.url)

    google.EE.on('job_done',(body)=>{
        res.end(body)
    })

    if(req.url == '/')
    {
        google.search()
    }
    else
    {
        google.local(req.url)
    }
}

const server = http.createServer()
server.on('request',onRequest)
server.listen(80)
