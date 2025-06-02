// creates the HTML code for one card that gets later inserted into index.html
function createCardHTML(index, name, imageURL) {
    return  `<div class="card" onmouseenter="makeCardBigger(this)" onmouseleave ="makeCardNormal(this)" onclick="clickCard(this)">
                <div class="cropped card-image-container">
                    <img src="${imageURL}" width="300px" class="card-image" onerror="handleImgLoadError(this)" data-cardindex="${index}">
                </div>
                <h3 class="card-name">${name}</h3>
            </div>`
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

// executed when card gets clicked -> opens card information page for that card
function clickCard(cardElement){
    // make card information page visible and background blurry
    cardInformationBackground.style.display = "block"
    mainElement.style.filter = "blur(5px)"

    disableScroll()
    
    const cardName = cardElement.querySelector(".card-name").innerHTML
    const cardIndex = parseInt(cardElement.querySelector("img").dataset.cardindex)

    const shouldStoreCurrentUrl = true
    navigateToCardURL(cardName, shouldStoreCurrentUrl)
    fillCardInfoPage(cardIndex)
}

function handleImgLoadError(image) {
    // if image of one card could not be loaded (maybe bc doesn't exist) then use question mark image instead
    image.src="images/Question-Mark.png"

    // set the imageURL of card with unknown image in cardData to ""
    const cardIndex = image.dataset.cardindex
    cardData[cardIndex].variants[0] = ""
}