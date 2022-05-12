const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

class google
{
    constructor(url, stream) 
    {
        this.url = url
        this.stream = stream
        this.run()
    }

    run()
    {
        let url = this.decode_params()
        if(url)
        {
            this.crawl(url)
        }
        else if(this.url == '/')
        {
            this.static_file('index.html')
        }
        else
        {
            this.local()
        }
    }

    decode_params()
    {
        let data = {'url':['/url?q',''],'search':['q','https://www.google.com/search?q=']}
        for (const word in data) 
        {
            if(this.url.indexOf(word) == 1)
            {
                let params = new URLSearchParams(this.url)
                let ret = data[word][1] + params.get(data[word][0])
                return ret
            }
        }
    }

    local()
    {
        let ext = path.extname(this.url)
        if(ext == '.png' || ext == '.ico')
        {
            this.static_file(path.basename(this.url))
        }
        else
        {
            this.stream.end()
        }
    }

    static_file(path)
    {
        fs.readFile(path, (err, data) => {
            if (err) 
            {
                console.error(err)
            }
            this.stream.end(data)
        })
    }

    crawl(url)
    {
        let spider
        let stream = this.stream
        if(url.indexOf('https://') == 0)
        {
            spider = https.get(url)
        }
        else if(url.indexOf('http://') == 0)
        {
            spider = http.get(url)
        }

        spider.on('response',(res)=>{
            let data = []
            res.on('data',(chunk)=>{
                data.push(chunk)
            })
    
            res.on('end',()=>{
                stream.end(Buffer.concat(data))
            })
        })

        spider.on('error',(err)=>{
            console.log(err)
        })
    }
}

module.exports = google