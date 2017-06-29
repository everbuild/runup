import {recv} from './io'
import DevEngineStub from './DevEngineStub'
import updateFlows from './updateFlows.js'

const engine = new DevEngineStub()

recv(msg => {
    if(msg.change) {
        const change = msg.change
        updateFlows[change.updateFlow].forEach(fn => fn(change, engine))
    }
})
