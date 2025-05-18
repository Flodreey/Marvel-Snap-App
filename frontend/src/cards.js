async function getCardsFromBackend(api_url) {
    try {
        const response = await fetch(api_url)
        const responseJson = await response.json() 
        const totalCardCount = responseJson.totalCardCount
        const backendCards = responseJson.cards
        return { 
            cards: backendCards, 
            totalCardCount, 
            hasErrorHappened: false 
        }
    } catch(error) {
        let localStorageCards = []
        for (let i = 0; i < localStorage.length; i++) {
            localStorageCards.push(JSON.parse(localStorage.getItem(i)))
        }
        return { 
            cards: localStorageCards, 
            totalCardCount: localStorageCards.length, 
            hasErrorHappened: true 
        }
    }
}

// fetches card data from server and fills cardList element in index.html with all card's HTML
async function fillCardsList(api_url, isSavingToLocalStorage) {
    const { cards, totalCardCount, hasErrorHappened } = await getCardsFromBackend(api_url)

    cardCount.querySelectorAll("span")[0].innerHTML = cards.length
    cardCount.querySelectorAll("span")[1].innerHTML = totalCardCount

    if (hasErrorHappened) {
        serverIssueMessage.style.display = "block"

        // disable search and filter functionality 
        enableSearchFilter(false)
    } else {
        // enable search and filter functionality 
        enableSearchFilter(true)
        
        if (cards.length === 0) {
            noResultMessage.style.display = "block"
            return
        }
        noResultMessage.style.display = "none"
   
        if (isSavingToLocalStorage && localStorage) {
            localStorage.clear()
        }
    }

    card_data = []
    cardList.innerHTML = ""
    cards.forEach((card, index) => {
        // create HTML for current card and insert it into index.html
        const card_html = createCardHTML(index, card.name, card.variants[0])
        cardList.insertAdjacentHTML("beforeend", card_html)

        const currentCardToStore = {
            name: card.name,
            description: card.description,
            variants: card.variants
        }
        card_data.push({index, ...currentCardToStore})

        if (!hasErrorHappened && isSavingToLocalStorage && localStorage) {
            const jsonString = JSON.stringify(currentCardToStore)
            localStorage.setItem(index, jsonString)
        }
    })
}

function setNameAndDescription(name, description) {
    bigCardName.innerHTML = name
    const strongDescription = description
                                .replace("On Reveal:", "<strong>On Reveal:</strong>")
                                .replace("Ongoing:", "<strong>Ongoing:</strong>")
                                .replace("Activate:", "<strong>Activate:</strong>")
                                .replace("Game Start:", "<strong>Game Start:</strong>")
                                .replace("End of Turn:", "<strong>End of Turn:</strong>")
    bigCardDescription.innerHTML = strongDescription
}

function fillCardInfoPage(card) {
    // set image of card information page
    // if card has an image (not question mark image) then show that image on card information page otherwise show no image
    if (card.variants[0] != "") {
        bigCardImage.style.display = "block"
        bigCardImage.querySelector("img").src = card.variants[0]
    } else {
        bigCardImage.style.display = "none"
    }
    
    setNameAndDescription(card.name, card.description)

    if (card.variants.length == 1) {
        variantButtonContainer.style.display = "none"
    } else {
        // card.variants = await preloadAndFilterImages(card.variants)
        variantButtonContainer.style.display = card.variants.length == 1 ? "none" : "block"
    }
    currently_looking_at = card.name
    variant_index = 0
}

async function clickNextCardButton(direction) {
    if (!["right", "left"].includes(direction)) {
        return
    }

    const current_card = getCardData(currently_looking_at)
    let next_card = undefined

    if (direction === "right" && current_card.index != card_data.length - 1) {
        next_card = card_data[current_card.index + 1]
    } else if (direction === "left" && current_card.index != 0) {
        next_card = card_data[current_card.index - 1]
    }
    if (next_card !== undefined) {
        const isOk = await slideCards(direction, current_card, next_card, () => {
            setNameAndDescription(next_card.name, next_card.description)
        })
        if (isOk) {
            navigateToCardURL(next_card.name)
            fillCardInfoPage(next_card)
        }
    }
}

function clickNextVariantButton(direction) {
    if (!["up", "down"].includes(direction)) {
        return
    }

    const current_card = getCardData(currently_looking_at)
    let nextVariantIndex = 0
    if (direction === "up") {
        nextVariantIndex = (variant_index + 1) % current_card.variants.length
    } else if (direction === "down") {
        nextVariantIndex = variant_index - 1
        if (nextVariantIndex == -1) 
            nextVariantIndex = current_card.variants.length - 1
    }
    
    let newURL = current_card.variants[nextVariantIndex]
    checkImage(newURL).then(async isValid => {
        const isOk = await slideVariants(direction, current_card, isValid ? newURL : "images/Question-Mark.png")
        if (isOk) variant_index = nextVariantIndex
    })
}