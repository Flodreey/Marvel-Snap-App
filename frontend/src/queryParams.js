function handleQueryParams() {
    const params = new URLSearchParams(window.location.search)

    const queryCard = params.has("card") && card_data.find(c => {
        return c.name.toLowerCase().replace(" ", "-") === params.get("card").toLowerCase()
    })
    if (queryCard) {
        window.history.replaceState({}, "", `?card=${queryCard.name.toLowerCase().replace(" ", "-")}`)

        cardInformationBackground.style.display = "block"
        mainElement.style.filter = "blur(5px)"

        disableScroll()

        fillCardInfoPage(queryCard)
    } else {
        console.log("no query card found")
        window.history.replaceState({}, "", window.location.pathname)
    }
}

function navigateToCardURL(cardName) {
    window.history.pushState({}, "", `?card=${cardName.toLowerCase().replace(" ", "-")}`)
}

function navigateToLandingURL() {
    window.history.pushState({}, "", window.location.pathname)
}