let seq = Math.floor(Math.random()*900)*100

module.exports = change => {
    const el = document.querySelectorAll(`link[href^="${change.entry}"]`)[0]
    if(el) {
        console.log(`${change.path} ${change.type} - replacing ${change.entry}`)
        const newEl = document.createElement('link')
        newEl.rel = 'stylesheet'
        newEl.href = change.entry + '?' + ++seq
        el.parentNode.replaceChild(newEl, el)
    } else {
        console.log(`${change.path} ${change.type} - reloading page`)
        location.reload()
    }
}
