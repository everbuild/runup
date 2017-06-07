let seq = Math.floor(Math.random()*900)*100

module.exports = change => {
    const el = document.querySelectorAll(`script[src^="${change.entry}"]`)[0]
    if(el) {
        console.log(`${change.path} ${change.type} - replacing ${change.entry}`)
        const newEl = document.createElement('script')
        newEl.src = change.entry + '?' + ++seq
        el.parentNode.replaceChild(newEl, el)
    } else {
        console.log(`${change.path} ${change.type} - reloading page`)
        location.reload()
    }
}
