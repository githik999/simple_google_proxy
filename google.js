const fs = require('fs')
const path = require('path')
const https = require('https')

const google = 
{   
    on_request : function(req,res)
    {
        let url = req.url
        if(url.indexOf('url') == 1)
        {
            google.fetch(url,res)
        }
        else if(url.indexOf('search') == 1)
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
    },

    fetch : function(url,stream)
    {
        let params = new URLSearchParams(url)
        let uri = params.get('/url?q')
        google.https_get(uri,stream)
    },

    search : function(url,stream)
    {
        let params = new URLSearchParams(url)
        let uri = 'https://www.google.com/search?q='+params.get('q')
        google.https_get(uri,stream)
    },

    https_get:function(url,stream)
    {
        https.get(url,(res)=>{
            let data = []
            res.on('data',(chunk)=>{
                data.push(chunk)
            })

            res.on('end',()=>{
                stream.end(Buffer.concat(data))
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