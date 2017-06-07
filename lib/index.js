const loadModel = require('./loadModel')

module.exports = (mode, modelFiles) => {
    const Engine = require(mode === 'build' ? './prd/PrdEngine' : './dev/DevEngine')
    const model = loadModel([require.resolve('./std/model')].concat(modelFiles))
    console.log(`Starting runup in ${mode} mode with model: ${JSON.stringify(model, null, '  ').replace(/"(.+?)":/g, '$1:').replace(/\\\\/g, '\\')}`)
    const engine = new Engine(model)
    return engine.start()
}