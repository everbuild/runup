const p = require('path')
const _ = require('lodash')
const mm = require('micromatch')


module.exports = class {
    constructor(model) {
        this.model = model
        this.Asset = defineAssetClass(this)
    }

    /**
     * @returns {Promise.<string[]>} array of all source files, relative to model.in
     * @abstract
     */
    list() {
    }

    /**
     * @param {string} path path relative to model.in
     * @returns {string} absolute path in the format of the platform
     */
    resolveIn(path) {
        return p.join(this.model.in, path)
    }

    /**
     * @param {string} path path relative to model.out
     * @returns {string} absolute path in the format of the platform
     */
    resolveOut(path) {
        return p.join(this.model.out, path)
    }

    /**
     * @param {string} path path relative to from
     * @param {string} from absolute path to a file (not a directory!)
     * @returns path relative to model.in
     */
    translateIn(path, from) {
        const abs = p.join(p.dirname(from), path)
        return p.relative(this.model.in, abs)
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

    resolveFlow(path, scenario) {
        const stop = this.model.verbose ? this.time(`resolve ${scenario} flow for "${path}"`) : flow => flow
        if(!['dev', 'prd', 'check'].includes(scenario)) throw new Error(`Invalid flow scenario: ${scenario}`)
        const cat = this.model.assets.find(cat => cat[scenario] && (!cat.filter || this.match(path, cat.filter)))
        if(!cat) throw new Error(`No ${scenario} flow found for path "${path}"!`)
        return Promise.resolve(require(cat[scenario])).then(stop)
    }

    process(path, scenario) {
        const stop = this.time(`${scenario} "${path}"`)
        const asset = new this.Asset(path)
        return this.resolveFlow(path, scenario)
            .then(fn => fn(asset, this))
            .then(stop, err => asset.addError(err))
            .then(() => {
                asset.errors.forEach(error => console.error(getErrorString(error)))
                asset.warnings.forEach(warning => console.error(warning))
                return asset
            })
    }

    processMany(paths, scenario) {
        const processOne = path => this
            .process(path, scenario)
            // convert error back into rejected promise so the Promise.all fails
            .then(asset => asset.errors[0] ? Promise.reject(asset.errors[0]) : asset)
        return Promise.all(paths.map(processOne))
    }

    processAll(scenario) {
        const globs = _(this.model.assets).filter(scenario).map(cat => cat.filter || '**/*').uniq().value()
        return this.search(globs).then(files => this.processMany(files, scenario))
    }

    unixify(path) {
        return process.platform === 'win32' ? path.replace(/\\/g, '/') : path
    }

    time(ref) {
        const t0 = process.hrtime()
        return value => {
            const dt = process.hrtime(t0)
            console.log(`${ref}: ${Math.round(dt[0]*1000000 + dt[1]/1000)/1000}ms`)
            return value
        }
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
            _(errors).flatten().compact().map(normalizeError).each(error => {
                this.errors.push(error)
                if(error.file) this.addDependency(error.file)
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


function normalizeError(error) {
    const normal = {original: error}
    normal.message = error.message || JSON.stringify(error)
    if(error.loc) {
        normal.file = error.loc.file
        normal.line = error.loc.line
        normal.column = error.loc.column
    } else {
        normal.file = error.file || error.filename
        normal.line = error.line
        normal.column = error.column || error.col
    }
    return normal
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