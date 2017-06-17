const p = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')
const _ = require('lodash')
const klaw = require('klaw')
const Engine = require('../Engine')


module.exports = class extends Engine {
    constructor(model) {
        super(model)
        this.filesPromise = listFiles(model.in)
    }

    start() {
        return this.processAll('check')
            .then(() => fs.emptyDir(this.model.out))
            .then(() => this.search(this.model.entry))
            .then(paths => this.processMany(paths, 'prd'))
            .then(() => console.log(`Saved files to: ${this.model.out}`))
    }

    list() {
        return this.filesPromise
    }

    process(path, scenario) {
        if(!scenario) scenario = 'prd'
        return super.process(path, scenario).then(asset => scenario === 'prd' ? this.postProcess(asset) : asset)
    }

    postProcess(asset) {
        const data = asset.data || ''
        if(!this.match(asset.path, this.model.entry)) {
            asset.out = this.hash(data, asset.out)
        }
        return fs.outputFile(asset.out, data).then(() => asset)
    }


    hash(data, path) {
        const conf = this.model.prd.hash
        if(conf && conf.size > 0) {
            const hash = crypto.createHash(conf.algo).update(data).digest('hex').substr(0, conf.size)
            path = path.replace(/\.\w+$/, `-${hash}$&`)
        }
        return path
    }
}


function listFiles(path) {
    const files = []
    return new Promise((resolve, reject) => klaw(path)
        .on('data', data => data.stats.isFile() && files.push(p.relative(path, data.path)))
        .on('end', () => resolve(files))
        .on('error', reject))
}
