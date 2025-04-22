import express from "express"
import axios from "axios"
import cors from "cors"

import { filter_function, sort_function } from "./utils.js"

const app = express()
app.use(cors())

const PORT = 8000
const MARVEL_SNAP_ZONE_API = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true"

app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT} \n`)
})

async function getCardsFromAPI() {
    try {
        const response = await axios(MARVEL_SNAP_ZONE_API)
        return response.data.success.cards
    } catch (error) {
        console.log("Error fetching cards from API:")
        console.log(error)
        throw error
    }
}

function mapCardsFromAPI(cardsFromAPI) {
    return cardsFromAPI.map(cardFromAPI => {
        let name = cardFromAPI.name

        let description = "None"
        if (cardFromAPI.ability != "")
            description = cardFromAPI.ability
        else if (cardFromAPI.flavor != "") 
            description = cardFromAPI.flavor
        description = description.replaceAll("<span>", "").replaceAll("</span>", "")

        let imageURL = cardFromAPI.art
        
        let variants = [imageURL, ...cardFromAPI.variants.map(v => v.art)]

        return {name, description, imageURL, variants}
    })
}

app.get('/cards', async (req, res) => {
    console.log(`client called endpoint: /cards/${req.url}`)

    const cards = mapCardsFromAPI(await getCardsFromAPI())

    res.json(cards)
});

app.get("/cards/filter", async (req, res) => {
    console.log(`client called endpoint: /cards/${req.url}`)

    let search_string = req.query.search
    let cost_string = req.query.cost 
    let power_string = req.query.power 
    let ability_string = req.query.ability 
    let status_string = req.query.status 
    let sorting_string = req.query.sorting 
    let direction_string = req.query.direction

    // it shouln't happen, but if somehow filter items are undefined, then we set them to default values
    if (search_string == undefined) 
        search_string = "all"
    if (cost_string == undefined) 
        cost_string = "all"
    if (power_string == undefined) 
        power_string = "all"
    if (ability_string == undefined) 
        ability_string = "all"
    if (status_string == undefined) 
        status_string = "all"
    if (sorting_string == undefined) 
        sorting_string = "name"
    if (direction_string == undefined) 
        direction_string = "up"

    const cards = mapCardsFromAPI(await getCardsFromAPI())

    let cards_filtered = cards.filter(card => filter_function(card, search_string, cost_string, power_string, ability_string, status_string))

    cards_filtered = cards_filtered.sort((c1, c2) => sort_function(c1, c2, sorting_string, direction_string))

    res.json(cards_filtered)
})