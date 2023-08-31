// html elements
const cardList = document.getElementById("card-list")
const noResultMessage = document.getElementById("no-results-message")
const serverIssueMessage = document.getElementById("server-issue-message")
const mainElement = document.querySelector("main")
const cardInformationBackground = document.getElementById("card-information-background")
const bigCardImage = document.getElementById("big-card-image")
const bigCardName = document.getElementById("big-card-name")
const bigCardDescription = document.getElementById("big-card-description")
const filterContainer = document.getElementById("filter-container")
const sortContainer = document.getElementById("sort-container")
const sortDirection = document.getElementById("sort-direction")
const applyButton = document.getElementById("apply-button")
const costContainer = document.getElementById("cost-container")
const powerContainer = document.getElementById("power-container")
const abilityContainer = document.getElementById("ability-container")
const statusContainer = document.getElementById("status-container")
const filterWarning = document.getElementById("filter-warning")

var card_data = []
var currently_looking_at = ""

fillCardsList("http://localhost:8000/cards/")

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
function fillCardsList(api_url){
    card_data = []
    var index = 0
    fetch(api_url)
        .then(response => response.json())
        .then(data => {
            localStorage.clear()
            if (data.length == 0){
                noResultMessage.style.display = "block"
            } else {
                noResultMessage.style.display = "none"
                data.forEach(card => {
                    // create HTML for current card and insert it into index.html
                    const card_html = createCardHTML(index, card.name, card.imageURL)
                    cardList.insertAdjacentHTML("beforeend", card_html)

                    // store data from server in card_data and in localStorage (so that application works also if server problems)
                    card_data.push({index: index, name: card.name, description: card.description, imageURL : card.imageURL})
                    if (localStorage) {
                        const jsonString = JSON.stringify({name: card.name, description: card.description, imageURL : card.imageURL})
                        localStorage.setItem(index, jsonString)    
                    }   

                    index++;
                })
            }
        }).catch(err => {
            serverIssueMessage.style.display = "block"
            // Server problems so we get the data for cards from localStorage 
            for (var i = 0; i < localStorage.length; i++) {
                const card = JSON.parse(localStorage.getItem(i))

                const card_html = createCardHTML(i, card.name, card.imageURL)
                cardList.insertAdjacentHTML("beforeend", card_html)

                card_data.push({index: i, name: card.name, description: card.description, imageURL: card.imageURL})
            }
        })
}

function handleImgLoadError(image) {
    // if image of one card could not be loaded (maybe bc doesn't exist) then use question mark image instead
    image.src="images/Question-Mark.png"
    image.width = 220

    // remove class cropped and add class unknown-image
    const cropped_divs = document.querySelectorAll(".cropped")
    cropped_divs.forEach(div => {
        if (div.querySelector("img") === image) {
            div.classList.remove("cropped")
            div.classList.add("unknown-image")
        }
    })

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

// executed when card gets clicked -> opens card information page for that card
function clickCard(card){
    // make card information page visible and background blurry
    cardInformationBackground.style.display = "block"
    mainElement.style.filter = "blur(5px)"
    
    const card_name = card.querySelector(".card-name").innerHTML
    const clicked_card = getCardData(card_name)

    // set image of card information page
    // if card has an image (not question mark image) then show that image on card information page otherwise show no image
    if (clicked_card.imageURL != "") {
        bigCardImage.style.display = "block"
        bigCardImage.querySelector("img").src = clicked_card.imageURL
    } else {
        bigCardImage.style.display = "none"
    }
    
    // set name of card information page
    bigCardName.innerHTML = card_name

    // set description of card information page and make "On Reveal:" and "Ongoing:" bold
    const card_description = clicked_card.description.replace("On Reveal:", "<strong>On Reveal:</strong>").replace("Ongoing:", "<strong>Ongoing:</strong>")
    bigCardDescription.innerHTML = card_description

    currently_looking_at = card_name
    disableScroll()
}

// executed when card information page gets closed (by pressing esc or by clicking on the background)
function turnOffCardInformation(){
    cardInformationBackground.style.display = "none"
    mainElement.style.filter = "none"
    currently_looking_at = ""
    enableScroll()
}

// when clicking on bigCardImage, bigCardName, bigCardDescription (which is inside cardInformationBackground) then 
// we don't want to close card information page
bigCardImage.addEventListener("click", (e) => {e.stopPropagation()})
bigCardName.addEventListener("click", (e) => {e.stopPropagation()})
bigCardDescription.addEventListener("click", (e) => {e.stopPropagation()})

// executed when something changes in the search bar
function search(input){
    cardList.innerHTML = ""
    const url = "http://localhost:8000/cards/search/" + input.value
    fillCardsList(url)
}

// handling key interaction
document.addEventListener("keydown", (e) => {

    if (cardInformationBackground.style.display === "block") {
        if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft") {
            const current_card = getCardData(currently_looking_at)
            let next_card = current_card
            if (e.key === "ArrowUp") {
                // do nothing yet
            } else if (e.key === "ArrowRight") {
                // show next card if possible
                if (current_card.index != card_data.length - 1)
                    next_card = card_data[current_card.index + 1]
            } else if (e.key === "ArrowDown") {
                // do nothing yet
            } else if (e.key === "ArrowLeft") {
                // show previous card if possible
                if (current_card.index != 0)
                    next_card = card_data[current_card.index - 1]
            }

            if (next_card.imageURL == "") {
                bigCardImage.style.display = "none"
            } else {
                bigCardImage.style.display = "block"
                bigCardImage.querySelector("img").src = next_card.imageURL
            }
            bigCardName.innerHTML = next_card.name
            bigCardDescription.innerHTML = next_card.description.replace("On Reveal:", "<strong>On Reveal:</strong>").replace("Ongoing:", "<strong>Ongoing:</strong>")
    
            currently_looking_at = next_card.name
        }

        if (e.key === "Escape") {
            turnOffCardInformation()
        }
    }
})

function disableScroll () {
    var xPos = window.scrollX;
    var yPos = window.scrollY;
    window.onscroll = () => window.scroll(xPos, yPos);
}

function enableScroll () {
    window.onscroll = () => {};
}

var filter_is_collapsed = true
function switchFilter() {
    if (!filter_is_collapsed) {
        filterContainer.style.transition = "max-height 1s, border 0.3s 0.5s, margin 0.2s 0.6s, padding 0.2s 0.6s"
        filterContainer.style.maxHeight = null
        filterContainer.style.border = "0px solid white"
        filterContainer.style.margin = "0px 30px 0px 30px"
        filterContainer.style.padding = "0px 10px 0px 10px"
    } else {
        filterContainer.style.transition = "max-height 1s"
        // filterContainer.style.maxHeight = filterContainer.scrollHeight + "px"
        filterContainer.style.maxHeight = "600px"
        filterContainer.style.border = "5px solid white"
        filterContainer.style.borderBottom = "none"
        filterContainer.style.margin = "0px 30px -30px 30px"
        filterContainer.style.padding = "0px 10px 40px 10px"
    }
    filter_is_collapsed = !filter_is_collapsed
}

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

function arrayToString(array){
    let result = ""
    array.forEach(x => {
        result += x + ","
    })
    return result.substring(0, result.length - 1)
}

function applyFilter() {
    if (!filter_greyed_out) {
        greyOutApplyButton(true)

        let cost_array = []
        let power_array = []
        let ability_array = []
        let status_array = [] 
        let sorting
        let direction 

        // read checked cost buttons
        costContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
            if (inp.checked) {
                // every id has format cost0, cost1, cost2, ... so we just cut away cost to get the number
                cost_array.push(inp.id.substring(4,inp.id.length))
            }
        })
        if (cost_array.includes("6")){
            cost_array.push("7")
            cost_array.push("8")
        }
        
        // read checked power buttons
        powerContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
            if (inp.checked) {
                // every id has format power0, power1, power2, ... so we just cut away cost to get the number
                power_array.push(inp.id.substring(5,inp.id.length))
            }
        })
        if (power_array.includes("-")){
            for (let i = -10; i <= -1; i++)
                power_array.push(i.toString())
        }
        if (power_array.includes("+")){
            for (let i = 11; i <= 20; i++)
                power_array.push(i.toString())
        }
        power_array = power_array.filter(v => {
            if (v === "+" || v === "-") 
                return false
            return true
        })

        // read checked ability buttons
        abilityContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
            if (inp.checked){
                ability_array.push(inp.id)
            }
        })

        // read checked status buttons
        statusContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
            if (inp.checked){
                status_array.push(inp.id)
            }
        })

        // read sorting preference
        const nameRadio = document.getElementById("name")
        const costRadio = document.getElementById("cost")
        const powerRadio = document.getElementById("power")
        if (nameRadio.checked == true) 
            sorting = "name"
        else if (costRadio.checked == true) 
            sorting = "cost"
        else if (powerRadio.checked == true) 
            sorting = "power"
        
        // read direction of sorting preference
        if (arrowPointingDown) 
            direction = "down"
        else 
            direction = "up"

        if (cost_array.length == 0 || power_array.length == 0 || ability_array.length == 0 || status_array.length == 0) {
            filterWarning.querySelector("p").style.display = "block"
        } else {
            filterWarning.querySelector("p").style.display = "none"

            const cost_string = arrayToString(cost_array) 
            const power_string = arrayToString(power_array)
            const ability_string = arrayToString(ability_array)
            const status_string = arrayToString(status_array)

            cardList.innerHTML = ""
            const url = "http://localhost:8000/cards/filter/" + cost_string + "/" + power_string + "/" + ability_string + "/" + status_string + "/" + sorting + "/" + direction
            console.log(url)
            fillCardsList(url)
        }
    }
}