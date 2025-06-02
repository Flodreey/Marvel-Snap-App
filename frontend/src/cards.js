async function getCardsFromBackend(apiURL) {
    try {
        const response = await fetch(apiURL)
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
async function fillCardsList(apiURL, isSavingToLocalStorage) {
    const { cards, totalCardCount, hasErrorHappened } = await getCardsFromBackend(apiURL)

    cardCount.querySelectorAll("span")[0].innerHTML = cards.length
    cardCount.querySelectorAll("span")[1].innerHTML = totalCardCount

    cardList.innerHTML = ""

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

    cardData = []
    cards.forEach((card, index) => {
        // create HTML for current card and insert it into index.html
        const cardHTML = createCardHTML(index, card.name, card.variants[0])
        cardList.insertAdjacentHTML("beforeend", cardHTML)

        const currentCardToStore = {
            name: card.name,
            description: card.description,
            variants: card.variants
        }
        cardData.push({index, ...currentCardToStore})

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

function fillCardInfoPage(cardIndex) {
    const card = cardData[cardIndex]
    if (!card) return
    
    // set image of card information page
    // if card has an image (not question mark image) then show that image on card information page otherwise show no image
    if (hasValidCardImage(card)) {
        bigCardImage.style.display = "flex"
        bigCardImage.querySelector("img").src = card.variants[0]
    } else {
        bigCardImage.style.display = "none"
    }
    
    setNameAndDescription(card.name, card.description)

    if (card.variants.length <= 1) {
        variantButtonContainer.style.display = "none"
    } else {
        // card.variants = await preloadAndFilterImages(card.variants)
        variantButtonContainer.style.display = card.variants.length == 1 ? "none" : "block"
    }
    currentlyLookingAtIndex = cardIndex
    variantIndex = 0

    preloadAndFilterImages(card.variants).then(newVariants => card.variants = newVariants)
}

async function clickNextCardButton(direction) {
    if (!["right", "left"].includes(direction) || !isSlideAnimationAllowed()) return
    slideTimestamp = Date.now()

    let nextCardIndex = getNextCardIndex(direction)
    if (nextCardIndex === -1) return 

    variantButtonContainer.style.display = "none"

    const currentCard = cardData[currentlyLookingAtIndex]
    const nextCard = cardData[nextCardIndex]

    const { currentImageClass, nextImageClass } = getAnimationClassesFromDirection(direction)

    const currentImage = bigCardImage.querySelector(".current")
    const nextImage = bigCardImage.querySelector(".next")

    if (!hasValidCardImage(currentCard) && hasValidCardImage(nextCard)) {
        nextImage.src = nextCard.variants[0]
        bigCardImage.style.display = "flex"
        currentImage.style.display = "none"
        addAnimationClass(nextImage, nextImageClass)
        addAnimationClass(bigCardImage, "expand-valid-image")

    } else if (hasValidCardImage(currentCard) && !hasValidCardImage(nextCard)) {
        addAnimationClass(currentImage, currentImageClass)
        addAnimationClass(bigCardImage, "shrink-invalid-image")

    } else if (hasValidCardImage(currentCard) && hasValidCardImage(nextCard)) {
        nextImage.src = nextCard.variants[0]
        addAnimationClass(currentImage, currentImageClass)
        addAnimationClass(nextImage, nextImageClass)
    }
    addAnimationClass(nameAndDescription, "fade-animation")

    await waitForMs(SLIDE_ANIMATION_DURATION / 2)
    setNameAndDescription(nextCard.name, nextCard.description)

    await waitForMs(SLIDE_ANIMATION_DURATION / 2)

    if (hasValidCardImage(nextCard)) currentImage.style.display = "block"

    removeAnimationclasses(bigCardImage)
    removeAnimationclasses(currentImage)
    removeAnimationclasses(nextImage)
    removeAnimationclasses(nameAndDescription)

    const shouldStoreCurrentUrl = false
    navigateToCardURL(nextCard.name, shouldStoreCurrentUrl)
    fillCardInfoPage(nextCardIndex)
}

async function clickNextVariantButton(direction) {
    const currentCard = cardData[currentlyLookingAtIndex]

    if (!["up", "down"].includes(direction) || !isSlideAnimationAllowed() || currentCard.variants.length <= 1)
        return 
    slideTimestamp = Date.now()

    variantIndex = getNextVariantIndex(direction, currentCard)
    const nextImageUrl = currentCard.variants[variantIndex]

    const currentImage = bigCardImage.querySelector(".current")
    const nextImage = bigCardImage.querySelector(".next")
    
    nextImage.src = nextImageUrl

    const { currentImageClass, nextImageClass } = getAnimationClassesFromDirection(direction)
    addAnimationClass(currentImage, currentImageClass)
    addAnimationClass(nextImage, nextImageClass)

    await waitForAnimationEnd(nextImage)

    currentImage.src = nextImageUrl
    removeAnimationclasses(currentImage)
    removeAnimationclasses(nextImage)
}

function getAnimationClassesFromDirection(direction) {
    if (!["right", "left", "up", "down"].includes(direction)) return

    let currentImageClass = ""
    let nextImageClass = ""

    if (direction === "right") {
        currentImageClass = "slide-center-to-left"
        nextImageClass = "slide-right-to-center"
    } else if (direction === "left") {
        currentImageClass = "slide-center-to-right"
        nextImageClass = "slide-left-to-center"
    } else if (direction === "up") {
        currentImageClass = "slide-center-to-bottom"
        nextImageClass = "slide-top-to-center"
    } else {
        currentImageClass = "slide-center-to-top"
        nextImageClass = "slide-bottom-to-center"
    }

    return { currentImageClass, nextImageClass }
}

function addAnimationClass(element, animationClass) {
    if (animationClasses.includes(animationClass)) {
        removeAnimationclasses(element)
        void element.offsetWidth
        element.classList.add(animationClass)
    }
}

function isSlideAnimationAllowed() {
    return Date.now() - slideTimestamp >= SLIDE_ANIMATION_DURATION + SLIDE_ANIMATION_DURATION / 30
}

function waitForAnimationEnd(element) {
    return new Promise(resolve => 
        element.addEventListener("animationend", () => resolve(), {once: true})
    )
}

function waitForMs(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

function removeAnimationclasses(element) {
    element.classList.remove(...animationClasses)
}