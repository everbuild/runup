const fs = require('fs-extra')
const parse5 = require('parse5')

module.exports = transform =>
    (asset, engine) =>
        new Promise((resolve, reject) => {
            const parser = new parse5.ParserStream()
            parser.once('finish', () => {
                resolve(parser.document)
            })
            parser.on('error', reject)
            fs.createReadStream(asset.in).on('error', reject).pipe(parser)
        }).then(doc => transform(doc, asset, engine)).then(document => {
            asset.data = parse5.serialize(document)
            asset.type = 'text/html'
        })