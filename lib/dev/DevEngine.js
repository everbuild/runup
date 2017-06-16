const p = require('path')
const _ = require('lodash')
const chokidar = require('chokidar')
const Engine = require('../Engine')
const DevServer = require('./DevServer')


module.exports = class extends Engine {
    constructor(model) {
        super(model)
        this.updateCats = _(this.model.assets).filter('update').uniqBy('filter').value()
        this.server = new DevServer()
        this.cache = new Map()
    }


    start() {
        const getClientCode = _.once(() => {
            const updateScripts = this.updateCats.map(cat => cat.update)
            const buildClient = require('./buildClient')
            return buildClient(updateScripts)
        })
        return Promise.all([
            this.server.start(this, getClientCode),
            this._startWatcher()
        ])
    }


    list() {
        const watched = this.watcher.getWatched()
        const files = _.flatMap(watched, (files, dir) => dir === '..' ? [] : files.map(file => p.join(dir, file)))
        return Promise.resolve(files)
    }


    get(path) {
        return Promise.resolve(this.getCached(path))
            .then(asset => asset && asset.errors.length === 0 ? asset : this.process(path))
    }

    /**
     * @return {Promise.<Asset>} cached asset if it exists, null otherwise
     */
    getCached(path) {
        return this.cache.get(path)
    }


    getAllCached() {
        return Promise.all(this.cache.values())
    }

    process(path, scenario) {
        if(!scenario) scenario = 'dev'
        const promised = super.process(path, scenario)
        if(scenario === 'dev') this.cache.set(path, promised)
        return promised
    }

    _startWatcher() {
        return new Promise((resolve, reject) => {
            this.watcher = chokidar.watch('.', {
                cwd: this.model.in,
                ignoreInitial: true,
                awaitWriteFinish: {
                    stabilityThreshold: 100,
                    pollInterval: 100
                }
            }).on('all', (type, path) => this
                .process(path, 'check')
                .then(check => !check.error && this.getAllCached())
                .then(assets => assets && assets.forEach(asset => {
                    if(this.match(path, asset.depends)) {
                        this._onChange(path, type, asset)
                    }
                }))
                .catch(error => console.error(`error handling ${type} "${path}" - ${error.stack || JSON.stringify(error)}`))
            ).on('ready', resolve).once('error', reject)
        })
    }


    _onChange(path, type, asset) {
        this.cache.delete(asset.path)
        const updateFlow = this.updateCats.findIndex(cat => !cat.filter || this.match(asset.path, cat.filter))
        const change = {
            asset: asset.path,
            source: path,
            type,
            updateFlow: updateFlow
        }
        this.server.dispatch({change})
    }
}
