// first function that gets called when website loads
function main() {
    window.location.state = { previous: window.location.pathname }
    handleQueryParams()
}

main()