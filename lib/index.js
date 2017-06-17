const loadModel = require('./loadModel')

module.exports = model => {
    const mode = model.mode
    console.log(`Starting Runup in ${mode} mode`)
    const Engine = require(mode === 'build' ? './prd/PrdEngine' : './dev/DevEngine')
    const engine = new Engine(loadModel(model))
    return engine.start().then(() => {
        console.log(`${mode === 'build' ? 'total' : 'startup'} time: ${Math.round(process.uptime()*1000)}ms`)
        return engine
    })
}