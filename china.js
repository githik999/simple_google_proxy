const fs = require('fs')
const iptn = require('./ipv4_to_number')

const china = 
{
    bucket : [],
    site : [],
    init:function()
    {
        fs.readFile('chn_ip_number_format.txt', (err, data) => {
            if (err) throw err
            this.init_bucket(data)
        })

        fs.readFile('china_site.txt', (err, data) => {
            if (err) throw err
            this.init_site(data)
        })
    },

    init_bucket : function(content)
    {
        let vec = content.toString().split('\n')
        for (const line of vec)
        {
            let arr = line.split(',')
            
            let start = parseInt(arr[0])
            let end = parseInt(arr[1])
            let range = []
            range.push(start)
            range.push(end)

            let k_start = china.get_key(start)
            let k_end = china.get_key(end)
            for (let i = k_start; i <= k_end; i++) 
            {
                china.insert(i,range)
            }
        }
    },

    init_site : function(content)
    {
        let vec = content.toString().split('\n')
        for (const domain of vec)
        {
            china.site[domain] = true
        }
    },

    insert : function(key,data)
    {
        if(!china.bucket[key]){china.bucket[key] = []}
        china.bucket[key].push(data)
    },

    check_host_name : function(str)
    {
        let tail = str.slice(-3)
        if(tail == '.cn')
        {
            return true
        }
        console.log(str,tail)
    },

    check : function(ip)
    {
        let num = iptn.ip_to_number(ip)
        return china.check_num(num)
    },

    check_num : function(num)
    {
        let k = china.get_key(num)
        let data = china.bucket[k]
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

    get_key : function(num)
    {
        return Math.floor(num/1000000)
    }

}

module.exports = china




