const p = require('path')


exports.asPromise = (action) => {
    return new Promise((resolve, reject) => {
        action((err, result) => {
            if(err) reject(err)
            else resolve(result)
        })
    })
}


exports.fixPath = process.platform === 'win32' ? path => path.replace(/\\/g, '/') : path => path


exports.isGlob = string => string.indexOf('*') !== -1


exports.time = ref => {
    const t0 = process.hrtime()
    return value => {
        const dt = process.hrtime(t0)
        console.log(`${ref}: ${Math.round(dt[0]*1000000 + dt[1]/1000)/1000}ms`)
        return value
    }
}


exports.require = id => {
    const stop = exports.time(`require ${id}`)
    const o = require(id)
    stop()
    return o
}


exports.translateRelativePath = (path, from, to) => p.relative(to, p.join(p.dirname(from), path))


