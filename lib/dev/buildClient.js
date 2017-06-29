const p = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const hypo = require('rollup-plugin-hypothetical')


function getUpdateFlowsCode(updateScripts, engine) {
    const updateFns = updateScripts
        .map(scripts => scripts.map(engine.unixify).map(script => `require('${script}')`))
        .map(fns => `[${fns.join()}]`)
    return `module.exports = [${updateFns.join()}]`
}


module.exports = (updateScripts, engine) => {
    const done = engine.time('build client')
    return rollup.rollup({
        entry: require.resolve('./client/client'),
        //external: ['sockjs-client'],
        context: 'window',
        plugins: [
            resolve(),
            commonjs(),
            hypo({
                files: {'updateFlows.js': getUpdateFlowsCode(updateScripts, engine)},
                allowRealFiles: true,
                cwd: p.join(__dirname, 'client')
            })
        ]
    }).then(bundle => {
        const result = bundle.generate({
            format: 'iife',
            exports: 'none',
            //globals: {'sockjs-client': 'SockJS'},
            sourceMap: false,
            interop: false
        })
        return result.code
    }).then(done)
}