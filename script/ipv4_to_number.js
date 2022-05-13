const iptn = 
{
    ip_to_number : function(ip)
    {
        let ret = 0
        let vec = ip.split('.')
        for (const key in vec) 
        {
            let m = vec[key] * Math.pow(2,8*(3-key))
            ret += m
        }
        return ret
    }
}

module.exports = iptn