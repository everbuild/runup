const p = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const hypo = require('rollup-plugin-hypothetical')


function getUpdateFlowsCode(updateScripts, engine) {
    const importCode = updateScripts.map((script, idx) => `import script${idx} from '${engine.unixify(script)}'`)
    const exportCode = `export default [${updateScripts.map((script, idx) => `script${idx}`).join(', ')}]`
    return importCode.concat(exportCode).join('\n')
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