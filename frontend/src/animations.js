async function slideCards(direction, card, nextCard, onHalfAnimationEnd) {

    if (!["right", "left"].includes(direction)) {
        return false
    }
    if (Date.now() - slideTimestamp < SLIDE_ANIMATION_DURATION + SLIDE_ANIMATION_DURATION / 30) {
        return false
    }
    slideTimestamp = Date.now()

    const currentImage = bigCardImage.querySelector(".current")
    const nextImage = bigCardImage.querySelector(".next")

    if (card.variants[0] === "" && nextCard.variants[0] === "") {
        onHalfAnimationEnd()
        return true
    } else {
        bigCardImage.style.display = "block"
    }
    nextImage.src = nextCard.variants[0]

    let currentImageClass = ""
    let nextImageClass = ""

    if (direction === "right") {
        currentImageClass = "slide-center-to-left"
        nextImageClass = "slide-right-to-center"
    } else {
        currentImageClass = "slide-center-to-right"
        nextImageClass = "slide-left-to-center"
    }

    addAnimationClass(currentImage, currentImageClass)
    addAnimationClass(nextImage, nextImageClass)
    addAnimationClass(nameAndDescription, "fade-animation")
    variantButtonContainer.style.display = "none"

    setTimeout(() => onHalfAnimationEnd(), SLIDE_ANIMATION_DURATION / 2)

    await waitForAnimationEnd(nextImage)

    currentImage.classList.remove(...animationClasses)
    nextImage.classList.remove(...animationClasses)
    nameAndDescription.classList.remove(...animationClasses)
    return true
}

async function slideVariants(direction, card, nextImageSrc) {
    if (!["up", "down"].includes(direction) || card.variants.length <= 1) {
        return false
    } 
    if (Date.now() - slideTimestamp < SLIDE_ANIMATION_DURATION + SLIDE_ANIMATION_DURATION / 30) {
        return false
    }
    slideTimestamp = Date.now()

    const currentImage = bigCardImage.querySelector(".current")
    const nextImage = bigCardImage.querySelector(".next")

    nextImage.src = nextImageSrc

    let currentImageClass = ""
    let nextImageClass = "" 

    if (direction === "up") {
        currentImageClass = "slide-center-to-bottom"
        nextImageClass = "slide-top-to-center"
    } else {
        currentImageClass = "slide-center-to-top"
        nextImageClass = "slide-bottom-to-center"
    }

    addAnimationClass(currentImage, currentImageClass)
    addAnimationClass(nextImage, nextImageClass)

    await waitForAnimationEnd(nextImage)

    currentImage.src = nextImageSrc
    currentImage.classList.remove(...animationClasses)
    nextImage.classList.remove(...animationClasses)

    return true
}

function addAnimationClass(element, animationClass) {
    if (animationClasses.includes(animationClass)) {
        element.classList.remove(...animationClasses)
        void element.offsetWidth
        element.classList.add(animationClass)
    }
}

function waitForAnimationEnd(element) {
    return new Promise(resolve => 
        element.addEventListener("animationend", () => resolve(), {once: true})
    )
}