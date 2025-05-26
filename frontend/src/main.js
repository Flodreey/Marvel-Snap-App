// first function that gets called when website loads
function main() {
    window.history.replaceState({previous: window.location.pathname}, "", getCurrentUrl())
    handleQueryParams()
}

main()