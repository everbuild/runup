const loadModel = require('./loadModel')

module.exports = model => {
    model = loadModel(model)
    const mode = model.mode
    console.log(`Starting Runup in ${mode} mode`)
    const Engine = require(mode === 'dev' ? './dev/DevEngine' : './prd/PrdEngine')
    const engine = new Engine(model)
    return engine.start(mode).then(() => {
        console.log(`${mode === 'dev' ? 'startup' : 'total'} time: ${Math.round(process.uptime()*1000)}ms`)
        return engine
    })
}