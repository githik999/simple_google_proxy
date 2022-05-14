const path = require('path')

const xurl = 
{
    find_proxy_target : function(url)
    {
        let params = new URLSearchParams(url)
        for (const [name, value] of params) 
        {
            if(value.startsWith('http') && !value.endsWith('url?q'))
            {
                return value
            }
        }
    },

    get_static_resource_link : function(path,ref)
    {
        let target = this.find_proxy_target(ref)
        if(!target){return path}
        let obj = new URL(target)
        let ret = obj.protocol+'//'+obj.hostname+path
        return ret
    },

    is_static_resource : function(str)
    {
        let vec = ['.png','.ico','.gif','.jpg','.jpeg']
        let ext = path.extname(str)
        for (const v of vec) 
        {
            if(ext == v)
            {
                return true
            }
        }
    },

    get_search_link : function(url)
    {
        let params = new URLSearchParams(url.slice(7))
        let ret = 'https://www.google.com/search?q='+params.get('q')+'&start='+params.get('start')
        return ret
    }
}

module.exports = xurl