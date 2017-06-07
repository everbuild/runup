const p = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const hypo = require('rollup-plugin-hypothetical')
const util = require('../util')


function getUpdateFlowsCode(updateScripts) {
    const importCode = updateScripts.map((script, idx) => `import script${idx} from '${util.fixPath(script)}'`)
    const exportCode = `export default [${updateScripts.map((script, idx) => `script${idx}`).join(', ')}]`
    return importCode.concat(exportCode).join('\n')
}


module.exports = updateScripts => {
    const done = util.time('build client')
    return rollup.rollup({
        entry: require.resolve('./client/client'),
        //external: ['sockjs-client'],
        context: 'window',
        plugins: [
            resolve(),
            commonjs(),
            hypo({
                files: {'updateFlows.js': getUpdateFlowsCode(updateScripts)},
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