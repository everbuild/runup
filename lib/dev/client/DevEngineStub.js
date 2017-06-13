import {send} from './io'

export default class {
    list() {
        return cmd('list')
    }

    search(patterns, files) {
        return cmd('search', [patterns, files])
    }

    match(file, patterns) {
        return cmd('match', [file, patterns])
    }

    resolveIn(path) {
        return cmd('resolveIn', [path])
    }

    resolveOut(path) {
        return cmd('resolveOut', [path])
    }

    process(path, flowName, includeContent) {
        return cmd('process', [path, flowName], includeContent)
    }

    get(path, includeContent) {
        return cmd('get', [path], includeContent)
    }

    getCached(path, includeContent) {
        return cmd('getCached', [path], includeContent)
    }

    getAllCached(includeContent) {
        return cmd('getAllCached', [], includeContent)
    }
}

function cmd(name, args, content) {
    return send({cmd: name, args, content: !!content}).then(resp => resp.data)
}
