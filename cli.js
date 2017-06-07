#!/usr/bin/env node
const start = new Date().valueOf()
const minimist = require('minimist')
const runup = require('./lib/index')

const argv = minimist(process.argv.slice(2), {
    default: {
        model: '?project.js'
    },
    alias: {
        model: 'm'
    }
})

const mode = argv._[0] || 'dev'
const modelFiles = argv.model.split(',').map(f => f.trim())

runup(mode, modelFiles).then(
    () => console.log(`${mode === 'build' ? 'total' : 'startup'} time: ${new Date().valueOf() - start}ms`),
    console.error
)