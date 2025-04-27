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
let card_data = []
let currently_looking_at = ""
let variant_index = 0
let filter_is_collapsed = true
let total_card_count = 0

let arrowPointingDown = false
let filter_greyed_out = true

// finds card with given name in card_data array and returns its data
function getCardData(card_name) {
    return card_data.find(card => card.name === card_name)
}