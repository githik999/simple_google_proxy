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

        this.init_gfw_list()
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

    init_gfw_list()
    {
        fs.readFile('res/g.f.w.list', (err, data) => {
            if (err) throw err
            const content = Buffer.from(data.toString(), 'base64').toString()
            let vec = content.split('\n')
            for (const v of vec) 
            {
                if(v.length < 40 && v.includes('.') && !v.endsWith('/') && !v.startsWith('@@||'))
                {
                    //let info = v.split('.')
                    let root = this.domain_root(v)
                    if(root.length <3)
                    {
                        console.log(v,root)
                    }
                    
                }
            }
        })
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
        if(this.in_gfw_list(domain))
        {
            return 0
        }
        
        if(domain.endsWith('.cn'))
        {
            return 1
        }
        
        if(this.is_white_root[domain])
        {
            return 1
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

    domain_root(str)
    {
        if(str.includes('://') && !str.startsWith('http'))
        {
            return
        }
        let domain = str.replace('http://','').replace('https://','').split('/')[0]
        console.log(domain)
        /*let pop_time = this.get_pop_time(domain)
        let vec = domain.split('.')
        for (let i = 0; i < pop_time; i++) 
        {
            vec.pop()
        }
        let ret = vec.pop().replace(/\|/g,'').replace(/!/g,'').replace('--','').replace(/@/g,'')
        return ret*/
    },

    

    get_pop_time(domain)
    {
        let special = ['.com.cn','.cz.cc','.eu.org','.com.tw','.co.id','.co.ma','.co.kr','.co.il','.co.uk','.cn.com','.co.jp','.co.tv','.or.jp','.or.kr','.or.id','.ne.jp','.go.jp','.co.nz']
        for (const v of special) 
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




