import express from "express"
import axios from "axios"
import cors from "cors"

import { checkImageURL, filter_function, sort_function } from "./utils.js"

const app = express()
app.use(cors())

const PORT = 8000
const MARVEL_SNAP_ZONE_API = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true"

let cachedCards = null
let cachedTimestamp = null
const CACHE_DURATION = 10 * 60 * 1000

app.listen(PORT, async () => {
    console.log(`starting server and filling cache...\n`)

    await getCardsFromAPI()

    console.log(`server running on PORT ${PORT} \n`)
})

async function getCardsFromAPI(makeImageChecks = true) {
    try {
        const response = await axios(MARVEL_SNAP_ZONE_API)
        cachedCards = await mapCardsFromAPI(response.data.success.cards, makeImageChecks)
        cachedTimestamp = Date.now()
        return cachedCards
    } catch (error) {
        console.log("Error fetching cards from API:")
        console.log(error)
        throw error
    }
}

async function mapCardsFromAPI(cardsFromAPI, makeImageChecks = true) {
    let mappedPromiseCards = cardsFromAPI.map(async cardFromAPI => {
        let name = cardFromAPI.name

        let description = "None"
        if (cardFromAPI.ability != "")
            description = cardFromAPI.ability
        else if (cardFromAPI.flavor != "") 
            description = cardFromAPI.flavor
        description = description.replaceAll("<span>", "").replaceAll("</span>", "")

        let imageURL = ""
        if (makeImageChecks) {
            const isValid = await checkImageURL(cardFromAPI.art)
            imageURL = isValid ? cardFromAPI.art : ""
        } else {
            imageURL = cardFromAPI.art
        }

        let variants = [imageURL, ...cardFromAPI.variants.map(v => v.art)]

        return {name, description, imageURL, variants}
    })

    return Promise.all(mappedPromiseCards)
}

app.get('/cards', async (req, res) => {
    console.log(`client called endpoint: ${req.url}`)

    if (cachedCards && (Date.now() - cachedTimestamp) < CACHE_DURATION) {
        console.log("Serving cards from cache")
        return res.json(cachedCards)
    }

    console.log("Cache expired or empty. Fetching fresh data...")

    const cards = await getCardsFromAPI()

    res.json(cards)
});

app.get("/cards/filter", async (req, res) => {
    console.log(`client called endpoint: ${req.url}`)

    let cards = []

    if (cachedCards && (Date.now() - cachedTimestamp) < CACHE_DURATION) {
        cards = cachedCards
    } else {
        cards = await getCardsFromAPI(false)
    }

    let search_string = req.query.search ?? "all"
    let cost_string = req.query.cost ?? "all"
    let power_string = req.query.power ?? "all"
    let ability_string = req.query.ability ?? "all"
    let status_string = req.query.status ?? "all"
    let sorting_string = req.query.sorting ?? "name"
    let direction_string = req.query.direction ?? "up"

    let cards_filtered = cards.filter(card => filter_function(card, search_string, cost_string, power_string, ability_string, status_string))
    
    cards_filtered = cards_filtered.sort((c1, c2) => sort_function(c1, c2, sorting_string, direction_string))

    res.json(cards_filtered)
})