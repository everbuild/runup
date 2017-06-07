const p = require('path')
const _ = require('lodash')

const base = process.cwd()

module.exports = files => files.reduce((merged, file) => {
    const optional = file[0] === '?'
    if(optional) file = file.substr(1)
    if(!p.isAbsolute(file)) file = p.join(base, file)
    try {
        const model = require(file)
        if(!model.base) model.base = p.dirname(file)
        if(!model.name) model.name = p.basename(model.base)
        if(model.in && !p.isAbsolute(model.in)) model.in = p.join(model.base, model.in)
        if(model.out && !p.isAbsolute(model.out)) model.out = p.join(model.base, model.out)
        if(!model.out) model.out = p.join(require('os').tmpdir(), model.name)
        if(!model.flows || !p.isAbsolute(model.flows)) model.flows = p.join(model.base, model.flows || 'flows')
        if(model.assets) {
            model.assets.forEach(cat => _.each(cat, (value, key) => {
                if(key !== 'filter' && !p.isAbsolute(value)) {
                    cat[key] = require.resolve(p.join(model.flows, value))
                }
            }))
            merged.assets = _.uniqBy(model.assets.concat(merged.assets), 'filter')
        }
        _.merge(merged, _.omit(model, 'assets'))
    } catch(e) {
        if(!optional || e.code !== 'MODULE_NOT_FOUND') throw e
    }
    return merged
}, {assets: []})
