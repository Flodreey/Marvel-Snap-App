// html elements
const cardList = document.getElementById("card-list")
const noResultMessage = document.getElementById("no-results-message")
const serverIssueMessage = document.getElementById("server-issue-message")
const mainElement = document.querySelector("main")
const cardInformationBackground = document.getElementById("card-information-background")
const bigCardImage = document.getElementById("big-card-image")
const bigCardName = document.getElementById("big-card-name")
const bigCardDescription = document.getElementById("big-card-description")
const variantButtonContainer = document.getElementById("variant-button-container")
const prevVariantButton = document.getElementById("prev-variant-button")
const nextVariantButton = document.getElementById("next-variant-button")
const prevCardButton = document.getElementById("prev-card-button")
const nextCardButton = document.getElementById("next-card-button")
const searchContainer = document.getElementById("search-container")
const searchField = document.getElementById("search-field")
const filterButton = document.getElementById("filter-button")
const filterContainer = document.getElementById("filter-container")
const sortContainer = document.getElementById("sort-container")
const sortDirection = document.getElementById("sort-direction")
const applyButton = document.getElementById("apply-button")
const costContainer = document.getElementById("cost-container")
const powerContainer = document.getElementById("power-container")
const abilityContainer = document.getElementById("ability-container")
const statusContainer = document.getElementById("status-container")
const filterWarning = document.getElementById("filter-warning")
const cardCount = document.getElementById("card-count")

// global variables
var card_data = []
var currently_looking_at = ""
var variant_index = 0
var filter_is_collapsed = true
var total_card_count = 0

fillCardsList("http://localhost:8000/cards/", true)

// creates the HTML code for one card that gets later inserted into index.html
function createCardHTML(index, name, imageURL) {
    const card_html =   `<div class="card" onmouseenter="makeCardBigger(this)" onmouseleave ="makeCardNormal(this)" onclick="clickCard(this)">
                            <div class="cropped card-image-container">
                                <img src="${imageURL}" width="300px" class="card-image" onerror="handleImgLoadError(this)" data-cardindex="${index}">
                            </div>
                            <h3 class="card-name">${name}</h3>
                        </div>`
    return card_html
}

// fetches card data from server and fills cardList element in index.html with all card's HTML
function fillCardsList(api_url, storeLocalStorage){
    card_data = []
    var index = 0
    fetch(api_url)
        .then(response => response.json())
        .then(data => {
            // enable search and filter functionality 
            enableSearchFilter(true)

            if (data.length == 0){
                noResultMessage.style.display = "block"
            } else {
                noResultMessage.style.display = "none"

                if (localStorage && storeLocalStorage) {
                    localStorage.clear()
                }

                data.forEach(card => {
                    // create HTML for current card and insert it into index.html
                    const card_html = createCardHTML(index, card.name, card.imageURL)
                    cardList.insertAdjacentHTML("beforeend", card_html)

                    // store data from server in card_data and in localStorage (so that application works also if server problems)
                    const name = card.name 
                    const description = card.description
                    const imageURL = card.imageURL 
                    const cost = card.cost 
                    const power = card.power 
                    const abilities = card.abilities 
                    const status = card.status 
                    const variants = card.variants
                    card_data.push({index, name, description, imageURL, cost, power, abilities, status, variants})
                    if (localStorage && storeLocalStorage) {
                        const jsonString = JSON.stringify({name, description, imageURL, cost, power, abilities, status, variants})
                        localStorage.setItem(index, jsonString)   
                    }   

                    index++;
                })
            }
        }).catch(err => {
            serverIssueMessage.style.display = "block"

            // disable search and filter functionality 
            enableSearchFilter(false)


            // Server problems so we get the data for cards from localStorage 
            for (var i = 0; i < localStorage.length; i++) {
                const card = JSON.parse(localStorage.getItem(i))

                const card_html = createCardHTML(i, card.name, card.imageURL)
                cardList.insertAdjacentHTML("beforeend", card_html)

                const index = i
                const name = card.name 
                const description = card.description
                const imageURL = card.imageURL 
                const cost = card.cost 
                const power = card.power 
                const abilities = card.abilities 
                const status = card.status 
                const variants = card.variants
                card_data.push({index, name, description, imageURL, cost, power, abilities, status, variants})
            }
        }).then(() => {
            // set card-count element after the card container
            if (storeLocalStorage) {
                total_card_count = card_data.length
            }
    
            cardCount.querySelectorAll("span")[0].innerHTML = card_data.length
            cardCount.querySelectorAll("span")[1].innerHTML = total_card_count
        })

}

async function preloadImages(urlArray) {
    urlArray.forEach(url => {
        const img = new Image()
        img.src = url
    })
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

function handleImgLoadError(image) {
    // if image of one card could not be loaded (maybe bc doesn't exist) then use question mark image instead
    image.src="images/Question-Mark.png"

    // set the imageURL of card with unknown image in card_data to ""
    const card_index = image.dataset.cardindex
    card_data[card_index].imageURL = ""
}

// executed when mouse enters area of one card
function makeCardBigger(card){
    const container = card.querySelector(".card-image-container")
    container.style.scale = "1.1"

    const cardname = card.querySelector(".card-name")
    cardname.style.transform = "translateY(10px)"
}

// executed when mouse leaves area of one card
function makeCardNormal(card){
    const container = card.querySelector(".card-image-container")
    container.style.scale = "1"

    const cardname = card.querySelector(".card-name")
    cardname.style.transform = "translateY(0px)"
}

// finds card with given name in card_data array and returns its data
function getCardData(card_name) {
    return card_data.find(card => card.name === card_name)
}

function fillCardInfoPage(card) {
    // set image of card information page
    // if card has an image (not question mark image) then show that image on card information page otherwise show no image
    if (card.imageURL != "") {
        bigCardImage.style.display = "block"
        bigCardImage.querySelector("img").src = card.imageURL
    } else {
        bigCardImage.style.display = "none"
    }
    
    // set name of card information page
    bigCardName.innerHTML = card.name

    // set description of card information page and make "On Reveal:", "Ongoing:", "Activate:", "Game Start:" and "End of Turn:" bold
    const card_description = card.description
                                .replace("On Reveal:", "<strong>On Reveal:</strong>")
                                .replace("Ongoing:", "<strong>Ongoing:</strong>")
                                .replace("Activate:", "<strong>Activate:</strong>")
                                .replace("Game Start:", "<strong>Game Start:</strong>")
                                .replace("End of Turn:", "<strong>End of Turn:</strong>")
    bigCardDescription.innerHTML = card_description

    if (card.variants.length == 1) {
        variantButtonContainer.style.display = "none"
    } else {
        variantButtonContainer.style.display = "block"
        preloadImages(card.variants)
    }
    currently_looking_at = card.name
    variant_index = 0
}

// executed when card gets clicked -> opens card information page for that card
function clickCard(card){
    // make card information page visible and background blurry
    cardInformationBackground.style.display = "block"
    mainElement.style.filter = "blur(5px)"

    disableScroll()
    
    const card_name = card.querySelector(".card-name").innerHTML
    const clicked_card = getCardData(card_name)

    fillCardInfoPage(clicked_card)
}

// executed when card information page gets closed (by pressing esc or by clicking on the background)
function turnOffCardInformation(){
    cardInformationBackground.style.display = "none"
    mainElement.style.filter = "none"
    currently_looking_at = ""
    variant_index = 0
    enableScroll()
}

// when clicking on bigCardImage, bigCardName, bigCardDescription, buttons (which are inside 
// cardInformationBackground) then we don't want to close card information page
bigCardImage.addEventListener("click", (e) => {e.stopPropagation()})
bigCardName.addEventListener("click", (e) => {e.stopPropagation()})
bigCardDescription.addEventListener("click", (e) => {e.stopPropagation()})
variantButtonContainer.addEventListener("click", (e) => {e.stopPropagation()})
document.querySelectorAll(".prev-next-card-buttons").forEach(button => {
    button.addEventListener("click", (e) => {e.stopPropagation()})
})

// handling key interaction
document.addEventListener("keydown", (e) => {

    if (cardInformationBackground.style.display === "block") {
        if (e.key === "ArrowUp") {
            clickNextVariantButton("up")
            nextVariantButton.classList.remove("arrow-button-not-hover")
            nextVariantButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowRight") {
            clickNextCardButton("forward")
            nextCardButton.classList.remove("arrow-button-not-hover")
            nextCardButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowDown") {
            clickNextVariantButton("down")
            prevVariantButton.classList.remove("arrow-button-not-hover")
            prevVariantButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowLeft") {
            clickNextCardButton("backward")
            prevCardButton.classList.remove("arrow-button-not-hover")
            prevCardButton.classList.add("arrow-button-hover")
        }

        if (e.key === "Escape") {
            turnOffCardInformation()
        }
    }
})

document.addEventListener("keyup", (e) => {

    if (cardInformationBackground.style.display === "block") {
        if (e.key === "ArrowUp") {
            nextVariantButton.classList.add("arrow-button-not-hover")
            nextVariantButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowRight") {
            nextCardButton.classList.add("arrow-button-not-hover")
            nextCardButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowDown") {
            prevVariantButton.classList.add("arrow-button-not-hover")
            prevVariantButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowLeft") {
            prevCardButton.classList.add("arrow-button-not-hover")
            prevCardButton.classList.remove("arrow-button-hover")
        }
    }
})

function clickNextCardButton(direction) {
    const current_card = getCardData(currently_looking_at)
    let next_card = current_card

    if (direction === "forward") {
        // show next card if possible
        if (current_card.index != card_data.length - 1)
            next_card = card_data[current_card.index + 1]
    } else if (direction === "backward") {
        // show previous card if possible
        if (current_card.index != 0)
            next_card = card_data[current_card.index - 1]
    }

    fillCardInfoPage(next_card)
}

function clickNextVariantButton(direction) {
    const current_card = getCardData(currently_looking_at)
    if (direction === "up") {
        variant_index = (variant_index + 1) % current_card.variants.length
    } else if (direction === "down") {
        variant_index--
        if (variant_index == -1) 
            variant_index = current_card.variants.length - 1
    }
    
    let newURL = getCardData(currently_looking_at).variants[variant_index]
    checkImage(newURL).then(isValid => {
        bigCardImage.querySelector("img").src = isValid ? newURL : "images/Question-Mark.png"
    })
}

function checkImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
    })
}

function disableScroll () {
    var xPos = window.scrollX;
    var yPos = window.scrollY;
    window.onscroll = () => window.scroll(xPos, yPos);
}

function enableScroll () {
    window.onscroll = () => {};
}

// collapses and extends the filter container
function switchFilter() {
    if (!filter_is_collapsed) {
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
    filter_is_collapsed = !filter_is_collapsed
}

// rotates the direction arrow in filter container
var arrowPointingDown = false
var rotationAngle = 0
function rotateDirArrow() {
    arrowPointingDown = !arrowPointingDown
    rotationAngle += 180
    sortDirection.style.transform = `rotate(${rotationAngle}deg)`
    greyOutApplyButton(false)
}

var filter_greyed_out = true
function greyOutApplyButton(enable){
    filter_greyed_out = enable
    if (enable){
        applyButton.style.filter = "blur(1px) grayscale(100%)"
        applyButton.style.opacity = "0.6"
    } else {
        applyButton.style.filter = "blur(0px) grayscale(0%)"
        applyButton.style.opacity = "1"
    }
}

// adding change events to all ALL-buttons in the filter container
document.querySelectorAll(".input-all").forEach(inp => {
    inp.addEventListener("change", () => {
        let container
        if (inp.id === "cost-all") {
            container = costContainer
        } else if (inp.id === "power-all") {
            container = powerContainer
        } else if (inp.id === "ability-all") {
            container = abilityContainer
        } else if (inp.id === "status-all") {
            container = statusContainer
        }

        container.querySelector(".checkbox-container").querySelectorAll("input").forEach(i => {
            if (!inp.checked) { // before clicking input was checked 
                i.checked = false
            } else { // before clicking input was not checked 
                i.checked = true
            }
        })

        greyOutApplyButton(false)
    })
})

// adding change events to all normal checkboxes in filter container
document.querySelectorAll(".input-check").forEach(inp => {
    inp.addEventListener("change", () => {

        let allButton
        let container
        if (inp.dataset.container === "cost") {
            allButton = document.getElementById("cost-all")
            container = costContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "power") {
            allButton = document.getElementById("power-all")
            container = powerContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "ability") {
            allButton = document.getElementById("ability-all")
            container = abilityContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "status") {
            allButton = document.getElementById("status-all")
            container = statusContainer.querySelector(".checkbox-container")
        }

        if (!inp.checked) { // before clicking input was checked
            allButton.checked = false
        } else { // before clicking input was not checked
            let all_inputs_checked = true
            container.querySelectorAll("input").forEach(i => {
                if (!i.checked) 
                    all_inputs_checked = false
            })
            if (all_inputs_checked) 
                allButton.checked = true
        }

        greyOutApplyButton(false)
    })
})

sortContainer.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
        greyOutApplyButton(false)
    })
})

function applyFilter(search_field) {
    if (!filter_greyed_out || search_field) {
        greyOutApplyButton(true)

        let search_string = ""
        let cost_string = ""
        let power_string = ""
        let ability_string = ""
        let status_string = ""
        let sorting_string = ""
        let direction_string = ""

        // read search field value
        search_string = searchField.querySelector("input").value

        // read checked cost buttons
        if (costContainer.querySelector("#cost-all").checked) {
            cost_string = "all"
        } else {
            costContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked) {
                    // every id has format cost0, cost1, cost2, ... so we just cut away cost to get the number
                    cost_string += inp.id.substring(4,inp.id.length) + ","
                }
            })
            if (cost_string.includes("6,")){
                cost_string += "7,8"
            }
        }
        
        // read checked power buttons
        if (powerContainer.querySelector("#power-all").checked) {
            power_string = "all"
        } else {
            powerContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked) {
                    // every id has format power0, power1, power2, ... so we just cut away cost to get the number
                    power_string += inp.id.substring(5,inp.id.length) + ","
                }
            })
            if (power_string.includes("-,")){
                for (let i = -10; i <= -1; i++)
                    power_string += i.toString() + ","
            }
            if (power_string.includes("+,")){
                for (let i = 11; i <= 20; i++)
                    power_string += i.toString() + ","
            }
            power_string = power_string.replaceAll("+,", "").replaceAll("-,", "")
        }

        // read checked ability buttons
        if (abilityContainer.querySelector("#ability-all").checked) {
            ability_string = "all"
        } else {
            abilityContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked){
                    ability_string += inp.id + "," 
                }
            })
        }

        // read checked status buttons
        if (statusContainer.querySelector("#status-all").checked) {
            status_string = "all"
        } else {
            statusContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked){
                    status_string = inp.id + ","
                }
            })
        }

        // read sorting preference
        const nameRadio = document.getElementById("name")
        const costRadio = document.getElementById("cost")
        const powerRadio = document.getElementById("power")
        if (nameRadio.checked == true) 
            sorting_string = "name"
        else if (costRadio.checked == true) 
            sorting_string = "cost"
        else if (powerRadio.checked == true) 
            sorting_string = "power"
        
        // read direction of sorting preference
        if (arrowPointingDown) 
            direction_string = "down"
        else 
            direction_string = "up"

        if (cost_string === "" || power_string === "" || ability_string === "" || status_string === "") {
            filterWarning.querySelector("p").style.display = "block"
        } else {
            filterWarning.querySelector("p").style.display = "none"

            cardList.innerHTML = ""
            const url = "http://localhost:8000/cards/filter?search=" + search_string + "&cost=" + cost_string + "&power=" + power_string + "&ability=" + 
                        ability_string + "&status=" + status_string + "&sorting=" + sorting_string + "&direction=" + direction_string
            fillCardsList(url, false)
        }
    }
}