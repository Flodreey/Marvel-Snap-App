// html elements
const cardList = document.getElementById("card-list")
const noResultMessage = document.getElementById("no-results-message")
const serverIssueMessage = document.getElementById("server-issue-message")
const mainElement = document.querySelector("main")
const cardInformationBackground = document.getElementById("card-information-background")
const bigCardImage = document.getElementById("big-card-image")
const bigCardName = document.getElementById("big-card-name")
const nameAndDescription = document.getElementById("name-and-description")
const bigCardDescription = nameAndDescription.querySelector("#big-card-description")
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
const currentImage = bigCardImage.querySelector(".current")
const nextImage = bigCardImage.querySelector(".next")
const radialGradientForeground = bigCardImage.querySelector(".radial-light")

// global variables
const backendURL = "http://localhost:8000/cards"
let cardData = []
let currentlyLookingAtIndex = -1
let variantIndex = 0
let isFilterCollapsed = true

let isArrowPointingDown = false
let isFilterGreyedOut = true

const SLIDE_ANIMATION_DURATION = 300   
document.documentElement.style.setProperty('--slide-animation-duration', `${SLIDE_ANIMATION_DURATION}ms`);
let slideTimestamp = Date.now()

const animationClasses = [
    "fade-animation",
    "shrink-invalid-image",
    "expand-valid-image",
    "slide-left-to-center", 
    "slide-right-to-center", 
    "slide-center-to-left", 
    "slide-center-to-right",
    "slide-top-to-center",
    "slide-bottom-to-center",
    "slide-center-to-top",
    "slide-center-to-bottom"
]