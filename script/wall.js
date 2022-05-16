const fs = require('fs')
const iptn = require('./ipv4_to_number')

const wall = 
{
    root_types : ['black','white'],
    init()
    {
        fs.readFile('res/white.ip', (err, data) => {
            if (err) throw err
            this.init_white_ip(data)
        })

        this.init_top_domain()
        this.init_root()
    },

    init_white_ip(content)
    {
        this.white_ips = []
        let vec = content.toString().split('\n')
        for (const line of vec)
        {
            let arr = line.split(',')
            
            let start = parseInt(arr[0])
            let end = parseInt(arr[1])
            let range = []
            range.push(start)
            range.push(end)

            let k_start = wall.get_key(start)
            let k_end = wall.get_key(end)
            for (let i = k_start; i <= k_end; i++) 
            {
                wall.insert(i,range)
            }
        }
    },

    init_top_domain()
    {
        this.top_domain = []
        fs.readFile('res/top.domain', (err, data) => {
            if (err) throw err
            let vec = data.toString().split('\n')
            for (const v of vec) 
            {
                if(v.includes('.'))
                {
                    this.top_domain.push(v.trim())
                }
            }
            this.init_gfw_list()
        })
    },

    init_gfw_list()
    {
        let obj = {}
        fs.readFile('res/g.f.w.list', (err, data) => {
            if (err) throw err
            const content = Buffer.from(data.toString(), 'base64').toString()
            let vec = content.split('\n')
            for (const v of vec) 
            {
                if(v.length < 40 && v.includes('.') && !v.startsWith('@@||') && !v.endsWith('.'))
                {
                    let domain = this.get_host(v)
                    if(!domain.endsWith('.tw') && !domain.endsWith('.hk') && !domain.endsWith('.cn'))
                    {
                        let root = this.domain_root(domain)
                        obj[root] = true
                    }
                }
            }
            this.write_to_black_root(obj)
        })
    },

    write_to_black_root(obj)
    {
        let ret_content = ''
        for (const str in obj) 
        {
            ret_content += str+'\n'
        }
        fs.writeFile('res/black.root',ret_content,(err)=>{})
    },

    init_root()
    {
        this.root = [[],[]]
        for (const key in this.root_types) 
        {
            let name = this.root_types[key]
            let file_path = 'res/' + name + '.root'
            fs.readFile(file_path, (err, content) => {
                if(!err)
                {
                    let vec = content.toString().split('\n')
                    for (const v of vec)
                    {
                        this.root[key][v.trim()] = true
                    }
                }else{
                    console.log(err.message)
                }
            })
        }
    },

    root_type(domain)
    {
        let root = this.domain_root(domain)
        if(wall.black_root[root])
        {
            return 0
        }
        if(wall.white_root[root])
        {
            return 1
        }
        return -1
    },

    add_white_root(domain)
    {
        let root = this.domain_root(domain)
        fs.appendFile(white_root_file,root,(err)=>{
            if(err) throw err
        })
    },

    insert(key,data)
    {
        if(!wall.white_ips[key]){wall.white_ips[key] = []}
        wall.white_ips[key].push(data)
    },

    check_domain(domain)
    {
        if(domain.endsWith('.cn') || domain.endsWith('.cn.com'))
        {
            return 1
        }
        
        if(this.is_white_root[domain])
        {
            return 1
        }

        if(this.in_gfw_list(domain))
        {
            return 0
        }

        return -1
    },

    check(ip)
    {
        let num = iptn.ip_to_number(ip)
        return wall.check_num(num)
    },

    check_num(num)
    {
        let k = wall.get_key(num)
        let data = wall.white_ips[k]
        if(!data){return false}
        
        for (const vec of data) 
        {
            if(num >= vec[0] && num <= vec[1])
            {
                return true
            }
        }
        return false
    },

    get_key(num)
    {
        return Math.floor(num/1000000)
    },

    domain_root(domain)
    {
        let pop_time = this.get_pop_time(domain)
        let vec = domain.split('.')
        for (let i = 0; i < pop_time; i++) 
        {
            vec.pop()
        }
        let ret = vec.pop()
        return ret
    },

    get_host(str)
    {
        let url = str.replace(/@/g,'').replace(/!/g,'').replace('--','').replace(/\|/g,'')
        let pos = url.indexOf('://')
        if(pos >= 0)
        {
            url = url.slice(pos+3)
        }
        pos = url.indexOf('/')
        if(pos > 0)
        {
            url = url.slice(0,pos)
        }
        
        if(url.startsWith('-'))
        {
            url = url.slice(1)
        }
        
        return url
    },

    get_pop_time(domain)
    {
        for (const v of this.top_domain) 
        {
            if(domain.trim().endsWith(v))
            {
                return 2
            }
        }
        return 1
    }

}

module.exports = wall




