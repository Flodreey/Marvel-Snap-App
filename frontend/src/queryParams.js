async function handleQueryParams() {
    const params = new URLSearchParams(window.location.search)
    // console.log(`query: ${params.toString()}`)

    const filterParamsArray = [
        params.has("cost"),
        params.has("power"),
        params.has("ability"),
        params.has("status"),
        params.has("sorting"),
        params.has("direction")
    ]

    if (filterParamsArray.includes(true) === filter_is_collapsed) {
        switchFilter()
    }

    if (!params.has("search")) {
        searchField.querySelector("input").value = ""
        searchField.querySelector("input").blur()
    }

    if (!filterParamsArray.includes(true)) {
        resetFilterContainer()
    }

    if (params.has("card")) {
        if (card_data.length === 0) await fillCardsList(backendURL, true)
        const queryCard = card_data.find(c => c.name.toLowerCase().replace(" ", "-") === params.get("card").toLowerCase())
        if (queryCard) {
            replaceWindowState(`?card=${queryCard.name.toLowerCase().replace(" ", "-")}`)

            cardInformationBackground.style.display = "block"
            mainElement.style.filter = "blur(5px)"

            disableScroll()

            fillCardInfoPage(queryCard)
            return 
        }
    } else {
        cardInformationBackground.style.display = "none"
        mainElement.style.filter = "none"
        enableScroll()
    }
    
    if (filterParamsArray.includes(true) || params.has("search")) {
        if (filterParamsArray.includes(true)) {

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

        applyFilter(true, false)
        return

    }

    replaceWindowState(window.location.pathname)
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
    return filterString.split("-")
}

function removeNotAllowedValues(valueArray, container) {
    const allowedValues = Array.from(
        container.querySelectorAll(".checkbox-container input")
    ).map(inp => inp.dataset.value.toLowerCase())

    return valueArray.filter(value => allowedValues.includes(value))
}

function setCheckboxesOfContainer(container, valueArray) {
    if (valueArray.length === 0) {
        container.querySelector(".input-all").checked = true
        container.querySelectorAll(".checkbox-container input").forEach(inp => inp.checked = true)
    } else {
        container.querySelector(".input-all").checked = false
        container.querySelectorAll(".checkbox-container input").forEach(inp => {
            inp.checked = valueArray.includes(inp.dataset.value.toLowerCase())
        })
    }
}

function pushWindowState(url) {
    previousWindowState = window.location.pathname + window.location.search
    window.history.pushState({}, "", url)
}

function replaceWindowState(url) {
    window.history.replaceState({}, "", url)
}

function navigateToCardURL(cardName) {
    pushWindowState(`?card=${cardName.toLowerCase().replace(" ", "-")}`)
}

function navigateToLandingURL() {
    pushWindowState(window.location.pathname)
}