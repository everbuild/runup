#!/usr/bin/env node
const start = new Date().valueOf()
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
    default: {
        model: '?./project'
    },
    alias: {
        model: 'm',
        help: 'h'
    }
})

if(argv.help) {
    console.log(require('fs').readFileSync(require.resolve('./help.txt'), 'utf-8'))
} else {
    const runup = require('./lib/index')
    const mode = argv._[0] || 'dev'
    const modelFiles = argv.model.split(',').map(f => f.trim())

    runup(mode, modelFiles).then(
        () => console.log(`${mode === 'build' ? 'total' : 'startup'} time: ${new Date().valueOf() - start}ms`),
        error => {
            console.error(error)
            process.exit(1)
        }
    )
}