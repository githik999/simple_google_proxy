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
        if(this.url.indexOf('url') == 1)
        {
            //google.fetch(url,res)
        }
        else if(this.url.indexOf('search') == 1)
        {
            //google.search(url,res)
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
}

module.exports = google