#!/usr/bin/env node
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
    default: {
        model: '?./project',
        verbose: false
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
        mode: argv._[0] || 'dev',
        extend: argv.model.split(',').map(f => f.trim()),
        verbose: argv.verbose
    }

    runup(model).catch(error => {
        console.error(error)
        process.exit(1)
    })
}