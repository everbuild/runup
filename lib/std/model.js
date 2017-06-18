const p = require('path')

module.exports = {
    in: 'src',
    entry: 'index.html',
    flows: p.join(__dirname, 'flows'),
    assets: [
        {
            filter: '**/*.js',
            update: 'update-js'
        },
        {
            filter: '**/*.css',
            update: 'update-css'
        },
        {
            filter: '**/*.html',
            dev: 'html/dev',
            prd: 'html/prd'
        },
        {
            dev: 'load',
            prd: 'load',
            check: 'noop',
            update: 'reload'
        }
    ],
    server: {
        port: 3000
    },
    prd: {
        hash: {
            algo: 'sha1',
            size: 6
        }
    },
    mode: 'dev',
    verbose: false
}
