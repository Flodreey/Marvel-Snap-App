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
    currently_looking_at = ""
    variant_index = 0
    enableScroll()
}