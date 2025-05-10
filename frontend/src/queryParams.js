

async function handleQueryParams() {
    const params = new URLSearchParams(window.location.search)

    if (params.has("card")) {
        await fillCardsList(backendURL, true)
        const queryCard = card_data.find(c => c.name.toLowerCase().replace(" ", "-") === params.get("card").toLowerCase())
        if (queryCard) {
            console.log(`card route: ${queryCard.name}`)
            window.history.replaceState({}, "", `?card=${queryCard.name.toLowerCase().replace(" ", "-")}`)

            cardInformationBackground.style.display = "block"
            mainElement.style.filter = "blur(5px)"

            disableScroll()

            fillCardInfoPage(queryCard)
            return 
        }
    } 
    
    if (params.has("filter") || params.has("search")) {
        console.log("filter route")
        if (params.has("filter")) {
            if (filter_is_collapsed) switchFilter()
            // TODO: parse filter query parameter            
        }

        if (params.has("search")) {
            searchField.querySelector("input").value = params.get("search")
        }
        
        applyFilter(true)
        return

    }

    console.log("Home Page Route")
    window.history.replaceState({}, "", window.location.pathname)
    await fillCardsList(backendURL, true)
}

function navigateToCardURL(cardName) {
    window.history.pushState({}, "", `?card=${cardName.toLowerCase().replace(" ", "-")}`)
}

function navigateToLandingURL() {
    window.history.pushState({}, "", window.location.pathname)
}