const fs = require('fs-extra')
const mime = require('mime')

module.exports = asset => {
    asset.type = mime.lookup(asset.path)
    return fs.readFile(asset.in).then(data => asset.data = data)
}
