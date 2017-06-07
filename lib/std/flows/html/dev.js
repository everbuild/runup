const fs = require('fs-extra')
const _ = require('lodash')
const parse5 = require('parse5')

const tagsToMerge = ['html', 'head', 'body']

function merge(toNode, fromNode) {
    if(toNode.childNodes && fromNode.childNodes) {
        const existingNodes = _.keyBy(toNode.childNodes, n => n.nodeName)
        fromNode.childNodes.forEach(fromChild => {
            const existingNode = existingNodes[fromChild.nodeName]
            if(existingNode && tagsToMerge.includes(fromChild.nodeName)) {
                merge(existingNode, fromChild)
            } else {
                toNode.childNodes.push(fromChild)
            }
        })
    }
    return toNode
}

module.exports = fs
    .readFile(require.resolve('./dev.html'), {encoding: 'utf-8'})
    .then(parse5.parse)
    .then(refDoc => doc => merge(doc, refDoc))
    .then(transform => require('./parse')(transform))
