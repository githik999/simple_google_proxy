const fs = require('fs')
const path = require('path')
const https = require('https')
const EventEmitter = require('events')


const google = 
{
    EE : new EventEmitter(),
    search : function()
    {
        https.get('https://www.google.com/',(res)=>{
            let data = []
            res.on('data',(chunk)=>{
                data.push(chunk)
            })

            res.on('end',()=>{
                google.job_done(Buffer.concat(data))
            })
            
        }).on('error',(err)=>{
            console.log(err)
        })
    },

    index : function(stream)
    {
        google.static_file('index.html',stream)
    },
    
    local : function(url,stream)
    {
        let ext = path.extname(url)
        if(ext == '.png' || ext == '.ico')
        {
            google.static_file(path.basename(url),stream)
        }
        else
        {
            stream.end()
        }
    },

    static_file : function(path,stream)
    {
        fs.readFile(path, (err, data) => {
            if (err) 
            {
                console.error(err)
            }
            stream.end(data)
        })
    },
    
}

module.exports = google