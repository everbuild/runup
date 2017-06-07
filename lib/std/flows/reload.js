module.exports = change => {
    console.log(`${change.path} ${change.type} - reloading page`)
    location.reload()
}
