// collapses and extends the filter container
function switchFilter() {
    if (!isFilterCollapsed) {
        filterContainer.style.transition = "max-height 1s, border 0.3s 0.5s, margin 0.2s 0.6s, padding 0.2s 0.6s"
        filterContainer.style.maxHeight = null
        filterContainer.style.border = "0px solid white"
        filterContainer.style.margin = "0px 30px 0px 30px"
        filterContainer.style.padding = "0px 10px 0px 10px"
    } else {
        filterContainer.style.transition = "max-height 1s"
        filterContainer.style.maxHeight = (filterContainer.scrollHeight + 50) + "px"
        // filterContainer.style.maxHeight = "600px"
        filterContainer.style.border = "5px solid white"
        filterContainer.style.borderBottom = "none"
        filterContainer.style.margin = "0px 30px -30px 30px"
        filterContainer.style.padding = "0px 10px 40px 10px"
    }
    isFilterCollapsed = !isFilterCollapsed
}

// rotates the direction arrow in filter container
function rotateDirArrow() {
    isArrowPointingDown = !isArrowPointingDown
    sortDirection.style.transform = `rotate(${isArrowPointingDown ? 180 : 0}deg)`
    greyOutApplyButton(false)
}

function setDirArrow(direction) {
    switch(direction) {
        case "up":
            if (isArrowPointingDown) rotateDirArrow()
            break
        case "down":
            if (!isArrowPointingDown) rotateDirArrow()
            break
    }
}

function greyOutApplyButton(enable){
    isFilterGreyedOut = enable
    if (enable){
        applyButton.style.filter = "blur(1px) grayscale(100%)"
        applyButton.style.opacity = "0.6"
    } else {
        applyButton.style.filter = "blur(0px) grayscale(0%)"
        applyButton.style.opacity = "1"
    }
}

function applyFilter(isSearchField, isPushingWindowState=true) {
    // clicking on a greyed out filter button does nothing
    if (isFilterGreyedOut && !isSearchField) {
        return 
    }

    greyOutApplyButton(true)

    const url = readFilterInputsAndBuildUrl(backendURL)

    if ([url.searchParams.get("cost"), url.searchParams.get("power"), url.searchParams.get("ability"), url.searchParams.get("status")].some(x => x === "")) {
        filterWarning.querySelector("p").style.display = "block"
        return
    } else {
        filterWarning.querySelector("p").style.display = "none"
    }

    if (isPushingWindowState) {
        if (url.search) {
            pushWindowState(url.search)
        } else {
            navigateToLandingURL()
        }
    }
    
    fillCardsList(url.toString(), false)
}

function readFilterInputsAndBuildUrl(baseURL) {
    const url = new URL(baseURL)

    // read search field value
    const searchString = searchField.querySelector("input").value.trim()
    if (searchString) {
        url.searchParams.set("search", searchString)
    }

    // read checked cost buttons
    const costArray = readCheckedFilterInputs("cost")
    if (costArray) {
        if (costArray.includes("6")) costArray.push("gt6")
        url.searchParams.set("cost", costArray.join("-"))
    }

    // read checked power buttons
    const powerArray = readCheckedFilterInputs("power")
    if (powerArray) {
        url.searchParams.set("power", powerArray.join("-"))
    }

    // read checked ability buttons
    const abilityArray = readCheckedFilterInputs("ability")
    if (abilityArray) {
        url.searchParams.set("ability", abilityArray.join("-"))
    }

    // read checked status buttons
    const statusArray = readCheckedFilterInputs("status")
    if (statusArray) {
        url.searchParams.set("status", statusArray.join("-"))
    }

    // read sorting preference
    const sortingString = getSortingChoice()
    if (sortingString && sortingString !== "name") {
        url.searchParams.set("sorting", sortingString) // only setting parameter to "cost" or "power" bc "name" is default
    }

    // read direction of sorting preference
    if (isArrowPointingDown) {
        url.searchParams.set("direction", "down") // only setting parameter to "down" bc "up" is default
    }

    return url
}

function readCheckedFilterInputs(category) {

    let categoryContainer = null
    let allInputSelector = null

    switch(category) {
        case "cost": 
            categoryContainer = costContainer
            allInputSelector = "#cost-all"
            break
        case "power":
            categoryContainer = powerContainer
            allInputSelector = "#power-all"
            break
        case "ability":
            categoryContainer = abilityContainer
            allInputSelector = "#ability-all"
            break
        case "status":
            categoryContainer = statusContainer
            allInputSelector = "#status-all"
            break
    }

    if (categoryContainer.querySelector(allInputSelector).checked) {
        return null
    }
    return Array.from(categoryContainer.querySelectorAll(".checkbox-container input"))
            .filter(inp => inp.checked)
            .map(inp => inp.dataset.value)
}

function getSortingChoice() {
    if (document.getElementById("name").checked) return "name"
    if (document.getElementById("cost").checked) return "cost"
    if (document.getElementById("power").checked) return "power"
    return null
}