const fs = require('fs')
const dns = require('dns')
const path = require('path')
const http = require('http')
const https = require('https')
const china = require('./china')

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
            let params = new URLSearchParams(this.url)
            let url = params.get('/url?q')
            this.judge(url)
        }
        else if(this.url.indexOf('search') == 1)
        {
            let params = new URLSearchParams(this.url.slice(7))
            let url = 'https://www.google.com/search?q='+params.get('q')+'&start='+params.get('start')
            this.crawl(url)
        }
        else if(this.url == '/' || this.url.indexOf('?sa=X') == 1)
        {
            this.static_file('res/google.html')
        }
        else
        {
            this.local()
        }
    }

    judge(url)
    {
        let obj = new URL(url)
        let inside = china.check_host_name(obj.hostname)
        if(inside)
        {
            this.no_need_proxy(url)
        }
        else
        {
            dns.lookup(obj.hostname,(err,ip,family)=>{
                let inside = china.check(ip)
                console.log(obj.hostname,ip,inside)
                if(inside)
                {
                    this.no_need_proxy(url)
                    china.add_site(obj.hostname)
                }
                else
                {
                    this.crawl(url)
                }
            })
        }
        
    }

    local()
    {
        let ext = path.extname(this.url)
        if(ext == '.png' || ext == '.ico')
        {
            this.static_file('res/'+path.basename(this.url))
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
            spider = https.request(url)
        }
        else if(url.indexOf('http://') == 0)
        {
            spider = http.request(url)
        }
        spider.setHeader('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0')
        spider.end()

        spider.on('response',(res)=>{
            let data = []
            res.on('data',(chunk)=>{
                data.push(chunk)
            })
    
            res.on('end',()=>{
                let html = Buffer.concat(data).toString().replace(/href="http/g, 'href="/url?q=http')
                stream.setHeader('Content-Type', 'text/html;charset=utf-8')
                stream.end(html)
            })
        })

        spider.on('error',(err)=>{
            console.log(err)
        })
    }

    no_need_proxy(url)
    {
        this.stream.statusCode = 301
        this.stream.setHeader("Location", url)
        this.stream.end()
    }
}

module.exports = google