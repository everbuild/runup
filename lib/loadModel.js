const p = require('path')
const _ = require('lodash')


module.exports = files => {
    const merged = {assets: []}
    merge(files)
    finalize(merged)
    return merged

    function merge(files) {
        _.flatten([files]).forEach(file => {
            const model = load(file)
            normalize(model, file)
            if(model.extend) merge(model.extend)
            _.merge(merged, _.omit(model, 'assets'))
            Array.prototype.unshift.apply(merged.assets, model.assets)
        })
    }
}


function load(file) {
    const optional = file[0] === '?'
    if(optional) file = file.substr(1)
    if(file[0] === '.') file = p.resolve(file)
    else file = require.resolve(file)
    try {
        return require(file)
    } catch(e) {
        if(optional && e.code === 'MODULE_NOT_FOUND') return {}
        throw e
    }
}


function normalize(model, file) {
    if(!model.base) model.base = p.dirname(file)
    if(!model.flows || !p.isAbsolute(model.flows)) model.flows = p.join(model.base, model.flows || 'flows')
    if(!model.assets) model.assets = []
    model.assets.forEach(cat => _.each(cat, (value, key) => {
        if(key !== 'filter' && !p.isAbsolute(value)) {
            cat[key] = require.resolve(p.join(model.flows, value))
        }
    }))
}


function finalize(model) {
    if(!model.name) model.name = p.basename(model.base)
    if(model.in && !p.isAbsolute(model.in)) model.in = p.join(model.base, model.in)
    if(model.out && !p.isAbsolute(model.out)) model.out = p.join(model.base, model.out)
    if(!model.out) model.out = p.join(require('os').tmpdir(), model.name)
    model.assets = optimizeAssets(model.assets)
}


function optimizeAssets(assets) {
    const filters = _(assets).map('filter').uniq().value()
    const catsByFilter = _.groupBy(assets, 'filter')
    return filters.map(filter => _.merge.apply(_, catsByFilter[filter].reverse()))
}