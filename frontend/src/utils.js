function enableScroll () {
    window.onscroll = () => {};
}

function disableScroll () {
    var xPos = window.scrollX;
    var yPos = window.scrollY;
    window.onscroll = () => window.scroll(xPos, yPos);
}

function enableSearchFilter(enable) {
    if (enable) {
        searchField.querySelector("input").disabled = false
        filterButton.disabled = false
        searchContainer.classList.remove("disabled")
        filterButton.classList.remove("disabled")
        searchField.querySelector("input").classList.remove("not-allowed-cursor")
        filterButton.classList.remove("not-allowed-cursor")
    } else {
        searchField.querySelector("input").disabled = true
        searchField.querySelector("input").value = ""
        filterButton.disabled = true
        searchContainer.classList.add("disabled")
        filterButton.classList.add("disabled")
        if (!isFilterCollapsed) {
            console.log("collapsing filter")
            switchFilter()
        }
        searchField.querySelector("input").classList.add("not-allowed-cursor")
        filterButton.classList.add("not-allowed-cursor")
    }
}

function resetFilterContainer() {
    const allFilterContainers = [costContainer, powerContainer, abilityContainer, statusContainer]
    allFilterContainers.forEach(container => {
        container.querySelectorAll("input").forEach(inp => inp.checked = true)
    })

    sortContainer.querySelectorAll("input").forEach(inp => {
        if (inp.value === "name") inp.checked = true
        else inp.checked = false
    })

    setDirArrow("up")
}

function checkImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
    })
}

async function preloadAndFilterImages(urlArray) {
    const promiseUrlArray = urlArray.map(async url => {
        const isValid = await checkImage(url)
        return isValid ? url : ""
    })

    const result = await Promise.all(promiseUrlArray)
    return result.filter(url => url !== "")
}

// executed when card information page gets closed (by pressing esc or by clicking on the background)
function turnOffCardInformation(){
    cardInformationBackground.style.display = "none"
    mainElement.style.filter = "none"
    currentlyLookingAtIndex = -1
    variantIndex = 0
    enableScroll()
    pushWindowState(getPreviousUrl())
}

function getNextCardIndex(direction) {
    if (!["right", "left"].includes(direction)) return -1

    if (direction === "right" && currentlyLookingAtIndex != cardData.length - 1) {
        return currentlyLookingAtIndex + 1
    } else if (direction === "left" && currentlyLookingAtIndex != 0) {
        return currentlyLookingAtIndex - 1
    }
    return -1
}

function getNextVariantIndex(direction, card) {
    if (!["up", "down"].includes(direction)) return -1

    if (direction === "up") {
        return (variantIndex + 1) % card.variants.length
    } else {
        return (variantIndex === 0) ? card.variants.length - 1 : variantIndex - 1
    }
}

function hasValidCardImage(card) {
    return card.variants[0] !== undefined && card.variants[0] !== ""
}