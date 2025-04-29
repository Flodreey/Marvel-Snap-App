
fillCardsList(backendURL, true)

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

async function fillCardInfoPage(card) {
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
        card.variants = await preloadAndFilterImages(card.variants)
        variantButtonContainer.style.display = card.variants.length == 1 ? "none" : "block"
    }
    currently_looking_at = card.name
    variant_index = 0
}

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