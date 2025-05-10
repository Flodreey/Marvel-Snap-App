async function handleQueryParams() {
    const params = new URLSearchParams(window.location.search)

    const filterParamsArray = [
        params.has("cost"),
        params.has("power"),
        params.has("ability"),
        params.has("status"),
        params.has("sorting"),
        params.has("direction")
    ]

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
    
    if (filterParamsArray.includes(true) || params.has("search")) {
        console.log("filter route")
        if (filterParamsArray.includes(true)) {
            if (filter_is_collapsed) switchFilter()

            const {
                costArray,
                powerArray,
                abilityArray,
                statusArray
            } = parseFilterParams(params)

            setCheckboxesOfContainer(costContainer, costArray)
            setCheckboxesOfContainer(powerContainer, powerArray)
            setCheckboxesOfContainer(abilityContainer, abilityArray)
            setCheckboxesOfContainer(statusContainer, statusArray)
        }

        if (params.has("search")) {
            searchField.querySelector("input").value = params.get("search")
        }

        if (params.has("sorting") && ["name", "cost", "power"].includes(params.get("sorting").toLocaleLowerCase())) {
            sortContainer.querySelectorAll("input").forEach(inp => {
                if (inp.value === params.get("sorting").toLocaleLowerCase()) {
                    inp.checked = true
                } else {
                    inp.checked = false
                }
            })
        }

        if (params.has("direction") && ["up", "down"].includes(params.get("direction").toLocaleLowerCase())) {
            setDirArrow(params.get("direction").toLocaleLowerCase())
        }
        
        const { cards, _} = await getCardsFromBackend(backendURL)
        cardCount.querySelectorAll("span")[1].innerHTML = cards.length

        applyFilter(true)
        return

    }

    console.log("Home Page Route")
    window.history.replaceState({}, "", window.location.pathname)
    await fillCardsList(backendURL, true)
}

function parseFilterParams(params) {
    let costArray = getValidatedParamArray(params.get("cost"), costContainer)
    let powerArray = getValidatedParamArray(params.get("power"), powerContainer)
    let abilityArray = getValidatedParamArray(params.get("ability"), abilityContainer)
    let statusArray = getValidatedParamArray(params.get("status"), statusContainer)

    return { costArray, powerArray, abilityArray, statusArray }
}

function getValidatedParamArray(filterString, htmlContainer) {
    let valueArray = splitFilterString(filterString).map(value => value.toLowerCase())
    return removeNotAllowedValues(valueArray, htmlContainer)
}

function splitFilterString(filterString) {
    if (!filterString) {
        return []
    }
    return filterString.split(",")
}

function removeNotAllowedValues(valueArray, container) {
    const allowedValues = Array.from(
        container.querySelectorAll(".checkbox-container input")
    ).map(inp => inp.dataset.value)

    return valueArray.filter(value => allowedValues.includes(value.toLowerCase()))
}

function setCheckboxesOfContainer(container, valueArray) {
    if (valueArray.length === 0) {
        container.querySelector(".input-all").checked = true
        container.querySelectorAll(".checkbox-container input").forEach(inp => inp.checked = true)
    } else {
        container.querySelector(".input-all").checked = false
        container.querySelectorAll(".checkbox-container input").forEach(inp => {
            inp.checked = valueArray.includes(inp.dataset.value)
        })
    }
}

function navigateToCardURL(cardName) {
    window.history.pushState({}, "", `?card=${cardName.toLowerCase().replace(" ", "-")}`)
}

function navigateToLandingURL() {
    window.history.pushState({}, "", window.location.pathname)
}