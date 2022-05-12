const fs = require('fs')
const https = require('https')
const google = require('./google')

const options = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.crt')
}

https.createServer(options,google.on_request).listen(443)