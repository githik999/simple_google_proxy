const path = require('path')

const xurl = 
{
    css_ref : [],
    find_proxy_target(url)
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

    get_static_resource_link(path,ref)
    {
        let target = this.find_proxy_target(ref)
        if(!target){return path}
        let ret = this.get_website_index(target)+path
        return ret
    },

    get_website_index(url)
    {
        let obj = new URL(url)
        return obj.protocol+'//'+obj.hostname
    },

    is_static_resource(str)
    {
        let vec = ['.png','.ico','.gif','.jpg','.jpeg','.css']
        let ext = path.extname(str)
        for (const v of vec) 
        {
            if(ext == v)
            {
                return true
            }
        }
    },

    get_search_link(url)
    {
        let params = new URLSearchParams(url.slice(7))
        let ret = 'https://www.google.com/search?q='+params.get('q')+'&start='+params.get('start')
        return ret
    },

    reg_css(css,ref)
    {
        let data = {css,ref}
        xurl.css_ref.push(data)
    },

    find_ref(css)
    {
        for (const v of xurl.css_ref) 
        {
            if(v.css == css)
            {
                return v.ref
            }
        }
    }
}

module.exports = xurl