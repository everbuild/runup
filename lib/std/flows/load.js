const fs = require('fs-extra')

module.exports = asset => fs.readFile(asset.in).then(data => asset.data = data)
