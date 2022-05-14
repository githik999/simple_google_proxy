const fs = require('fs')
const dns = require('dns')
const path = require('path')
const http = require('http')
const https = require('https')
const china = require('./china')
const xurl = require('./xurl')

class google
{
    constructor(client_req_url, referer , stream)
    {
        this.stream = stream
        this.referer = referer
        this.client_req_url = client_req_url
        this.run()
    }

    run()
    {
        if(this.client_req_url.startsWith('/url'))
        {
            this.judge(xurl.find_proxy_target(this.client_req_url))
        }
        else if(this.client_req_url.startsWith('/search'))
        {
            let url = xurl.get_search_link(this.client_req_url)
            this.crawl(url)
        }
        else if(this.client_req_url == '/')
        {
            this.local_resource('google.html')
        }
        else if(this.client_req_url.endsWith('.ico'))
        {
            this.local_resource('favicon.ico')
        }
        else if(xurl.is_static_resource(this.client_req_url))
        {
            let url = xurl.get_static_resource_link(this.client_req_url,this.referer)
            if(url.startsWith('http'))
            {
                this.crawl(url)
            }
            else
            {
                this.local_resource(path.basename(this.client_req_url))
            }
        }
        else
        {
            this.stream.end()
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

    local_resource(path)
    {
        fs.readFile('res/'+path, (err, data) => {
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
        console.log('crawl',url)
        if(url.startsWith('https://'))
        {
            spider = https.request(url)
        }
        else if(url.startsWith('http://'))
        {
            spider = http.request(url)
        }
        spider.setHeader('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0')
        spider.end()

        spider.on('response',(res)=>{
            let all_chunk = []
            res.on('data',(chunk)=>{
                all_chunk.push(chunk)
            })
    
            res.on('end',()=>{
                let ret = Buffer.concat(all_chunk)
                if(this.client_req_url.startsWith('/search'))
                {
                    ret = ret.toString().replace(/href="http/g, 'href="/url?q=http')
                }
                stream.end(ret)
            })
        })

        spider.on('error',(err)=>{
            console.log(err)
        })
    }

    no_need_proxy(url)
    {
        let uri = encodeURI(url)
        this.stream.statusCode = 301
        this.stream.setHeader("Location",uri)
        this.stream.end()
    }
}

module.exports = google