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
        if (!filter_is_collapsed) {
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
    currently_looking_at = -1
    variant_index = 0
    enableScroll()
    pushWindowState(window.location.state.previous || window.location.pathname)
}

function getNextCardIndex(direction) {
    if (!["right", "left"].includes(direction)) return -1

    if (direction === "right" && currently_looking_at != card_data.length - 1) {
        return currently_looking_at + 1
    } else if (direction === "left" && currently_looking_at != 0) {
        return currently_looking_at - 1
    }
    return -1
}

function getNextVariantIndex(direction, card) {
    if (!["up", "down"].includes(direction)) return -1

    if (direction === "up") {
        return (variant_index + 1) % card.variants.length
    } else {
        return (variant_index === 0) ? card.variants.length - 1 : variant_index - 1
    }
}

function hasValidCardImage(card) {
    return card.variants[0] !== ""
}