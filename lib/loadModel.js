const p = require('path')
const _ = require('lodash')


module.exports = model => {
    const merged = require('./std/model')
    normalize(merged)
    merge(model)
    finalize(merged)
    if(merged.verbose) print()
    return merged

    function merge(model) {
        normalize(model)
        if(model.extend) extend(model.extend)
        _.merge(merged, _.omit(model, 'assets'))
        Array.prototype.unshift.apply(merged.assets, model.assets)
    }

    function extend(files) {
        if(!Array.isArray(files)) files = [files]
        files.forEach(file => merge(load(file)))
    }

    function print() {
        const pretty = JSON.stringify(merged, null, '  ')
            .replace(/"(.+?)":/g, '$1:')
            .replace(/\\\\/g, '\\')
        console.log(`Model: ${pretty}`)
    }
}


function load(file) {
    const optional = file[0] === '?'
    if(optional) file = file.substr(1)
    let model = {}
    try {
        if(file[0] === '.') file = p.resolve(file)
        else file = require.resolve(file)
        model = require(file)
    } catch(e) {
        if(!optional || e.code !== 'MODULE_NOT_FOUND') throw e
    }
    if(!model.base) model.base = p.dirname(file)
    return model
}


function normalize(model) {
    if(!model.base) model.base = process.cwd()
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