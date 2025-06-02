async function handleQueryParams() {
    const params = new URLSearchParams(window.location.search)

    const {
        card,
        search,
        sorting, 
        direction,
        costArray,
        powerArray,
        abilityArray,
        statusArray
    } = await parseQueryParams(params)

    if (card) {
        replaceWindowState(`?card=${card.name.toLowerCase().replace(" ", "-")}`)
        cardInformationBackground.style.display = "block"
        mainElement.style.filter = "blur(5px)"
        disableScroll()
        fillCardInfoPage(card.index)
        return 
    } else {
        cardInformationBackground.style.display = "none"
        mainElement.style.filter = "none"
        enableScroll()
    }

    if (search) {
        searchField.querySelector("input").value = params.get("search")
    } else {
        searchField.querySelector("input").value = ""
        searchField.querySelector("input").blur()
    }

    if (sorting) {
        sortContainer.querySelectorAll("input").forEach(inp => {
            inp.checked = inp.value === sorting.toLocaleLowerCase()
        })
    } else {
        sortContainer.querySelectorAll("input").forEach(inp => {
            if (inp.value === "name") inp.checked = true
            else inp.checked = false
        })
    }

    if (direction) {
        setDirArrow(params.get("direction").toLocaleLowerCase())
    } else {
        setDirArrow("up")
    }

    setCheckboxesOfContainer(costContainer, costArray)
    setCheckboxesOfContainer(powerContainer, powerArray)
    setCheckboxesOfContainer(abilityContainer, abilityArray)
    setCheckboxesOfContainer(statusContainer, statusArray)

    const isSomeFilterParamDefined = [sorting, direction, costArray, powerArray, abilityArray, statusArray].some(x => x !== undefined)
    if (isSomeFilterParamDefined === isFilterCollapsed) {
        switchFilter()
    }
    if (search || isSomeFilterParamDefined) {
        const url = readFilterInputsAndBuildUrl(window.location.origin + window.location.pathname)
        replaceWindowState(url.toString())
        applyFilter(true, false)
        return 
    }

    replaceWindowState(window.location.pathname)
    await fillCardsList(backendURL, true)
}

async function parseQueryParams(params) {

    let result = {
        card: undefined,
        search: undefined,
        sorting: undefined,
        direction: undefined,
        costArray: undefined,
        powerArray: undefined,
        abilityArray: undefined,
        statusArray: undefined
    }

    if (params.has("card")) {
        if (cardData.length === 0) await fillCardsList(backendURL, true)
        const queryCard = cardData.find(c => c.name.toLowerCase().replace(" ", "-") === params.get("card").toLowerCase())
        if (queryCard) {
            result.card = queryCard
            return result
        }
    }

    result.search = params.get("search")

    if (params.has("sorting") && ["name", "cost", "power"].includes(params.get("sorting").toLocaleLowerCase())) {
        result.sorting = params.get("sorting")
    }

    if (params.has("direction") && ["up", "down"].includes(params.get("direction").toLocaleLowerCase())) {
        result.direction = params.get("direction")
    }

    if (params.has("cost")) {
        let costArray = getValidatedParamArray(params.get("cost"), costContainer)
        if (costArray.length > 0) result.costArray = costArray
    }

    if (params.has("power")) {
        let powerArray = getValidatedParamArray(params.get("power"), powerContainer)
        if (powerArray.length > 0) result.powerArray = powerArray
    }

    if (params.has("ability")) {
        let abilityArray = getValidatedParamArray(params.get("ability"), abilityContainer)
        if (abilityArray.length > 0) result.abilityArray = abilityArray
    }

    if (params.has("status")) {
        let statusArray = getValidatedParamArray(params.get("status"), statusContainer)
        if (statusArray.length > 0) result.statusArray = statusArray
    }

    return result
}

function getValidatedParamArray(filterString, htmlContainer) {
    let valueArray = splitFilterString(filterString).map(value => value.toLowerCase())
    valueArray = removeNotAllowedValues(valueArray, htmlContainer)

    //TODO: read possible values from data-values in html
    let allPossibleValuesForContainer = []
    switch(htmlContainer) {
        case costContainer:
            allPossibleValuesForContainer = ["0", "1", "2", "3", "4", "5", "6"]
            break
        case powerContainer:
            allPossibleValuesForContainer = ["lt0", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "gt10"]
            break
        case abilityContainer:
            allPossibleValuesForContainer = ["noability", "ongoing", "other", "onreveal", "gamestart", "endofturn"]
            break
        case statusContainer:
            allPossibleValuesForContainer = ["released", "unreleased"]
            break
    }

    if (allPossibleValuesForContainer.map(v => valueArray.includes(v)).every(x => x === true)) {
        valueArray = []
    }

    return valueArray
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
    if (!valueArray || valueArray.length === 0) {
        container.querySelector(".input-all").checked = true
        container.querySelectorAll(".checkbox-container input").forEach(inp => inp.checked = true)
    } else {
        container.querySelector(".input-all").checked = false
        container.querySelectorAll(".checkbox-container input").forEach(inp => {
            inp.checked = valueArray.includes(inp.dataset.value.toLowerCase())
        })
    }
}

function pushWindowState(url, shouldStoreCurrentUrl = true) {
    let previous = shouldStoreCurrentUrl ? getCurrentUrl() : getPreviousUrl()
    window.history.pushState({previous}, "", url)
    // console.log(`pushing url ${url} and setting previous to ${previous}`)
}

function replaceWindowState(url) {
    let previous = getPreviousUrl()
    window.history.replaceState({previous}, "", url)
    // console.log(`replacing url ${url} and setting previous to ${previous}`)
}

function navigateToCardURL(cardName, shouldStoreCurrentUrl = true) {
    pushWindowState(`?card=${cardName.toLowerCase().replace(" ", "-")}`, shouldStoreCurrentUrl)
}

function navigateToLandingURL() {
    pushWindowState(window.location.pathname)
}

function getCurrentUrl() {
    return window.location.pathname + window.location.search
}

function getPreviousUrl() {
    return window.history.state?.previous || window.location.pathname
}