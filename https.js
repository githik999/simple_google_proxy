const fs = require('fs')
const https = require('https')
const google = require('./google')

const options = {
    key: fs.readFileSync('127.0.0.1.key'),
    cert: fs.readFileSync('127.0.0.1.cert')
}

https.createServer(options,google.on_request).listen(443)