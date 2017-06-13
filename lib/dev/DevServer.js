const http = require('http')
const _ = require('lodash')
const sockjs = require('sockjs')
const express = require('express')
const morgan = require('morgan')


module.exports = class {
    start(engine, getClientCode) {
        this.engine = engine

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
                    this.execCmd(msg).then(reply => {
                        reply.id = msg.id
                        con.write(JSON.stringify(reply))
                    })
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

    execCmd(msg) {
        const fn = this.engine[msg.cmd]
        if(!fn) return Promise.resolve({error: 'invalid cmd: ' + msg.cmd})
        return Promise.resolve(fn.apply(this.engine, msg.args))
            .then(result => {
                if(_.isArray(result)) result = result.map(r => packResult(r, msg.includeContent))
                else result = packResult(result, msg.includeContent)
                return {result}
            })
            .catch(error => {
                console.error(error)
                return {error: error.toString()}
            })
    }
}


function packResult(result, includeContent) {
    if(result && result.data) {
        const packed = _.omit(result, 'data')
        if(includeContent) packed.data = result.data.toString()
        return packed
    } else {
        return result
    }
}