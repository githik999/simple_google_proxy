const fs = require('fs')
const dns = require('dns')
const path = require('path')
const http = require('http')
const https = require('https')
const wall = require('./wall')
const xurl = require('./xurl')
const DOMAIN = require('./domain_block_status')

class google
{
    constructor(client_req_url, referer , stream)
    {
        this.stream = stream
        this.referer = referer
        this.client_req_url = client_req_url
        this.open_new_tab = false
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
        let domain_status = wall.check_domain(obj.hostname)
        if(domain_status == DOMAIN.BLOCK)
        {
            console.log(obj.hostname,'is block')
            this.proxy(url,domain_status)
        }
        else if(domain_status == DOMAIN.UNBLOCK)
        {
            console.log(obj.hostname,'not block')
            this.no_proxy(url)
        }
        else if(domain_status == DOMAIN.UNKNOWN)
        {
            console.log(obj.hostname,'unknown')
            this.no_proxy(url)
        }
        else if(domain_status == DOMAIN.UNKNOWN)
        {
            console.log(obj.hostname,'unknown')
            dns.lookup(obj.hostname,(err,ip,family)=>{
                let ip_status = wall.check_ip(ip)
                if(ip_status == DOMAIN.UNBLOCK)
                {
                    console.log(ip,'inside')
                    this.no_proxy(url)
                    wall.add_white_root(obj.hostname)
                }
                else
                {
                    console.log(ip,'outside')
                    this.proxy(url,ip_status)
                }
            })
        }
        else
        {
            throw('check domain error')
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
        console.log('crawl',url)
        if(url.startsWith('https://'))
        {
            let options = {rejectUnauthorized:false}
            spider = https.request(url,options)
        }
        else if(url.startsWith('http://'))
        {
            spider = http.request(url)
        }
        spider.setHeader('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0')
        spider.end()

        spider.on('response',(res)=>{
            let ext = res.headers['content-type']
            console.log(res.statusCode,res.statusMessage,ext)
            let all_chunk = []
            res.on('data',(chunk)=>{
                all_chunk.push(chunk)
            })
    
            res.on('end',()=>{
                let ret = Buffer.concat(all_chunk)
                if(ext.includes('html'))
                {
                    this.send_html(ret.toString())
                }
                else
                {
                    this.stream.end(ret)
                }
            })
        })

        spider.on('error',(err)=>{
            console.log(err)
        })
    }

    proxy(url,status)
    {
        if(status == DOMAIN.UNKNOWN)
        {
            this.open_new_tab = true
        }
        this.actual_target = url
        this.crawl(url)
    }

    no_proxy(url)
    {
        let uri = encodeURI(url)
        this.stream.statusCode = 301
        this.stream.setHeader("Location",uri)
        this.stream.end()
    }

    send_html(str)
    {
        this.stream.setHeader('Content-Type', 'text/html; charset=utf-8')
        if(this.client_req_url.startsWith('/search'))
        {
            str = str.replace(/href="http/g, 'href="/url?q=http')
        }
        else if(this.client_req_url.startsWith('/url'))
        {
            let site = xurl.get_website_index(this.actual_target)
            let url = '/url?q='+site+'/'
            str = str.replace(/href="\//g,'href="'+url).replace(/href='\//g,'href="'+url).replace(/<img src="\//g,'<img src="'+url)
            if(this.open_new_tab)
            {
                let script = '<script>window.open("'+this.actual_target+'")</script>'
                str = str.replace('</body>',script+'</body>')
            }
            fs.writeFile(site,str,(err)=>{
                if(err){console.log(err.message)}
            })
        }
        
        this.stream.end(str)
    }
}

module.exports = google