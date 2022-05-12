# simple_google_proxy
a simple google proxy

const google = 
{   
    

    fetch : function(str,stream)
    {
        let params = new URLSearchParams(str)
        let url = params.get('/url?q')
        if(url.indexOf('https://') == 0)
        {
            https.get(url,this.on_fetch_result)
        }else if(url.indexOf('http://') == 0)
        {
            http.get(url,this.on_fetch_result)
        }
    },

    search : function(url,stream)
    {
        let params = new URLSearchParams(url)
        let uri = 'https://www.google.com/search?q='+params.get('q')
        google.https_get(uri,stream)
    },

    on_fetch_result : function(res,stream)
    {
        let data = []
        res.on('data',(chunk)=>{
            data.push(chunk)
        })

        res.on('end',()=>{
            stream.end(Buffer.concat(data))
        })
    }

    https_get:function(url,stream)
    {
        https.get(url,(res)=>{
            
            
        }).on('error',(err)=>{
            console.log(err)
        })
    },

    
    
    

 
    
}

module.exports = google