# simple_google_proxy
a simple google proxy

const google = 
{   
    

    fetch : function(str,stream)
    {
        
        if(url.indexOf('https://') == 0)
        {
            https.get(url,this.on_fetch_result)
        }else if(url.indexOf('http://') == 0)
        {
            http.get(url,this.on_fetch_result)
        }
    },

    

    

   
    
    
    

 
    
}

module.exports = google