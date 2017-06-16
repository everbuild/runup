module.exports = change => {
    console.log(`${change.source} ${change.type} - reloading page`)
    location.reload()
}
