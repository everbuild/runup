import {send} from './io'

export default class {
    list() {
        return send({cmd: 'list'}).then(resp => resp.data)
    }

    resolveIn(path) {
        return send({cmd: 'resolveIn', path}).then(resp => resp.data)
    }

    resolveOut(path) {
        return send({cmd: 'resolveOut', path}).then(resp => resp.data)
    }

    search(patterns, files) {
        return send({cmd: 'search', patterns, files}).then(resp => resp.data)
    }

    get(path, includeContent) {
        return send({cmd: 'get', path, includeContent}).then(resp => resp.data)
    }

    getCached(path, includeContent) {
        return send({cmd: 'getCached', path, includeContent}).then(resp => resp.data)
    }

    getAllCached(includeContent) {
        return send({cmd: 'getAllCached', includeContent}).then(resp => resp.data)
    }
    process(path, flowName, includeContent) {
        return send({cmd: 'process', path, flowName, includeContent}).then(resp => resp.data)
    }
}

