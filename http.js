const http = require('http')
const google = require('./google.js')

http.createServer((req,res)=>{
    new google(req.url,res)
}).listen(80)