#!/usr/bin/env node
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
    default: {
        model: '?./project'
    },
    alias: {
        model: 'm',
        verbose: 'v',
        help: 'h'
    }
})

if(argv.help) {
    console.log(require('fs').readFileSync(require.resolve('./help.txt'), 'utf-8'))
} else {
    const runup = require('./lib/index')

    const model = {
        mode: argv._[0],
        extend: argv.model.split(',').map(f => f.trim()),
        verbose: argv.verbose
    }

    runup(model).catch(error => {
        if(model.verbose) console.error(error)
        process.exit(1)
    })
}