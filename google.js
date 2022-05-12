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

    index : function()
    {
        google.static_file('index.html')
    },
    
    local : function(url)
    {
        let ext = path.extname(url)
        if(ext == '.png' || ext == '.ico')
        {
            google.static_file(path.basename(url))
        }
        else
        {
            google.job_done()
        }
    },

    static_file : function(path)
    {
        fs.readFile(path, (err, data) => {
            if (err) 
            {
                console.error(err)
            }
            google.job_done(data)
        })
    },

    job_done :function (data)
    {
        google.EE.emit('job_done',data)
    }
    
}

module.exports = google