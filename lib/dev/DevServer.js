const http = require('http')
const _ = require('lodash')
const sockjs = require('sockjs')
const express = require('express')
const morgan = require('morgan')


module.exports = class {
    start(engine, getClientCode) {
        let clientCodeProm

        return new Promise((resolve, reject) => {
            const app = express().disable('etag')

            app.use(morgan('dev'))

            const handleError = next => err => {
                if(err) console.log(err)
                next()
            }

            app.get('/.runup/client.js', (req, res, next) => getClientCode().then(code => res
                    .set('Content-Type', 'text/javascript')
                    .set('Cache-Control', 'max-age=86400')
                    .send(code)
                ))

            app.use(express.static(__dirname + '/assets'))

            app.use((req, res, next) => {
                if(req.method == 'GET' && !_.startsWith(req.path, '/.runup/')) {
                    let path = req.path
                    if(path == '' || path.substr(-1) == '/') path += 'index.html'
                    if(path[0] == '/') path = path.substr(1)
                    engine.get(path).then(asset => {
                        if(!asset.data) return next()
                        if(asset.type) res.set('Content-Type', asset.type)
                        res.set('Cache-Control', 'no-store')
                        res.send(asset.data)
                    }, handleError(next))
                } else {
                    next()
                }
            })

            this.http = http.createServer(app)

            const sockjsUrl = `http://cdn.jsdelivr.net/sockjs/${require('sockjs-client/package.json').version}/sockjs.min.js`
            this.socket = sockjs.createServer({sockjs_url: sockjsUrl})
            this.cons = []

            this.socket.on('connection', con => {
                this.cons.push(con)
                con.on('close', () => this.cons.splice(this.cons.indexOf(con), 1))
                con.on('data', data => {
                    const msg = JSON.parse(data)
                    engine[msg.cmd](msg.args).then(result => {
                        con.write(JSON.stringify({
                            id: msg.id,
                            result: result
                        }))
                    }, console.error)
                })
            })

            this.socket.installHandlers(this.http, {prefix: '/.runup/api'})

            this.http.on('error', err => {
                console.log('server error', err)
                if(!this.http.listening) reject(err)
            })

            this.http.listen(engine.model.server.port, () => {
                console.log(`server listening on http://localhost:${this.http.address().port}/`)
                resolve()
            })
        })
    }

    dispatch(msg) {
        const data = JSON.stringify(msg)
        this.cons.forEach(con => con.write(data))
    }
}
