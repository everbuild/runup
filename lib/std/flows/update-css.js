let seq = Math.floor(Math.random()*900)*100

module.exports = change => {
    const el = document.querySelectorAll(`link[href^="${change.asset}"]`)[0]
    if(el) {
        console.log(`${change.source} ${change.type} - replacing ${change.asset}`)
        const newEl = document.createElement('link')
        newEl.rel = 'stylesheet'
        newEl.href = change.asset + '?' + ++seq
        el.parentNode.replaceChild(newEl, el)
    } else {
        console.log(`${change.source} ${change.type} - reloading page`)
        location.reload()
    }
}
