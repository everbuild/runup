const p = require('path')

function getAllChildNodes(node) {
    return (node.childNodes || []).reduce((all, child) => all.concat(getAllChildNodes(child)), [node])
}

function transform(doc, asset, engine) {
    const destPath = p.dirname(asset.out)

    const srcAttrs = getAllChildNodes(doc).map(n => {
        let attr
        if(n.tagName == 'script') {
            attr = n.attrs.find(a => a.name == 'src')
        } else if(n.tagName == 'link') {
            attr = n.attrs.find(a => a.name == 'href')
        }
        if(attr && attr.value) return attr
    }).filter(i => i)

    const assetProcs = srcAttrs.map(attr => {
        const src = attr.value
        const path = src[0] == '/' ? src.substr(1) : engine.translateRelativePath(src, asset.in, engine.model.in)
        return engine.process(path, 'prd').then(childAsset => attr.value = p.relative(destPath, childAsset.out))
    })

    return Promise.all(assetProcs).then(() => doc)
}

module.exports = require('./parse')(transform)
