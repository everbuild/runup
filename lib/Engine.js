const p = require('path')
const _ = require('lodash')
const mm = require('micromatch')
const util = require('./util')


module.exports = class {
    constructor(model) {
        this.model = model
        this.Asset = defineAssetClass(this)
        Object.assign(this, _.omit(util, 'time', 'require'))
    }

    /**
     * @returns {Promise.<string[]>} array of all source files, relative to model.in
     * @abstract
     */
    list() {
    }

    /**
     * @param path path under model.src (usually in posix format, but not required)
     * @return {string} absolute path in the format of the platform
     */
    resolveIn(path) {
        return p.join(this.model.in, path)
    }

    /**
     * @param path path under model.src (usually in posix format, but not required)
     * @return {string} absolute path in the format of the platform
     */
    resolveOut(path) {
        return p.join(this.model.out, path)
    }

    /**
     * Find files under model.in using {@link https://github.com/micromatch/micromatch glob patterns}.
     * @param {string|string[]} patterns glob pattern or array thereof
     * @param {string[]|Promise.<string[]>} [files=all] optional array of files to search in stead of all files in the project
     * @return {Promise.<string[]>} array of matching files
     */
    search(patterns, files) {
        return Promise.resolve(files)
            .then(files => files || this.list())
            .then(files => mm(files, patterns))
    }

    /**
     * Does the given file match the given pattern?
     * @param {string} file filepath to match
     * @param {string|string[]} patterns glob pattern or array thereof
     * @return {boolean} true if matching, false otherwise
     */
    match(file, patterns) {
        return mm([file], patterns).length > 0
    }

    resolveFlow(path, flowName) {
        const stop = util.time(`resolve ${flowName} flow for "${path}"`)
        const cat = this.model.assets.find(cat => cat[flowName] && (!cat.filter || this.match(path, cat.filter)))
        return (cat ? Promise.resolve(require(cat[flowName])) : Promise.resolve(_.noop)).then(stop)
    }

    process(path, flowName) {
        const stop = util.time(`run ${flowName} flow for "${path}"`)
        const asset = new this.Asset(path)
        return this.resolveFlow(path, flowName)
            .then(fn => fn(asset, this))
            .then(stop, err => asset.addError(err))
            .then(() => {
                asset.errors.forEach(error => console.error(getErrorString(error)))
                asset.warnings.forEach(warning => console.error(warning))
                return asset
            })
    }

    processMany(paths, flowName) {
        const processOne = path => this
            .process(path, flowName)
            // convert error back into rejected promise so the Promise.all fails
            .then(asset => asset.errors[0] ? Promise.reject(asset.errors[0]) : asset)
        return Promise.all(paths.map(processOne))
    }

    processAll(flowName) {
        const globs = _(this.model.assets).filter(flowName).map(cat => cat.filter || '**/*').uniq().value()
        return this.search(globs).then(files => this.processMany(files, flowName))
    }
}


function defineAssetClass(engine) {
    return class {
        constructor(path) {
            this.path = path
            this.in = engine.resolveIn(path)
            this.out = engine.resolveOut(path)
            this.depends = [path]
            this.errors = []
            this.warnings = []
        }

        addDependency(...files) {
            _(files).flatten().compact()
                .map(file => p.isAbsolute(file) ? p.relative(engine.model.in, file) : file)
                .each(file => this.depends.push(file))
        }

        addError(...errors) {
            _(errors).flatten().compact().each(error => {
                const e = {original: error}
                e.message = error.message || JSON.stringify(error)
                if(error.loc) {
                    e.file = error.loc.file
                    e.line = error.loc.line
                    e.column = error.loc.column
                } else {
                    e.file = error.file || error.filename
                    e.line = error.line
                    e.column = error.column || error.col
                }
                this.errors.push(e)
                if(e.file) this.addDependency(e.file)
            })
        }

        addWarning(...warnings) {
            _(warnings).flatten().compact().each(warn => {
                this.warnings.push(warn)
                console.log(warn)
            })
        }
    }
}

function getErrorString(error) {
    let loc = ''
    if(error.file) {
        loc = '\n' + error.file
        if(typeof error.line === 'number') {
            loc += ':' + error.line
            if(typeof error.column === 'number') loc += ':' + error.column
        }
    }
    return error.message + loc
}