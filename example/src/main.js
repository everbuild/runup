(function() {
    const p = document.createElement('p')
    p.textContent = 'runup is up and running!'
    const bod = document.body

    bod.insertBefore(p, bod.childNodes[0])
})()