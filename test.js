const xurl = require('./script/xurl')

let str = '/url?q=https://zh.wikipedia.org/w/load.php?lang=zh&modules=startup&only=scripts&raw=1&skin=vector'
xurl.find_proxy_target(str)
