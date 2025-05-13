import express from "express"
import axios from "axios"
import cors from "cors"

import { checkImageURL, filterAndSort } from "./utils.js"

const app = express()
app.use(cors())

const PORT = 8000
const MARVEL_SNAP_ZONE_API = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true"

let cachedCards = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // renewing cache every 24 hours

setInterval(() => getCardsFromAPI(), CACHE_DURATION) 

app.listen(PORT, async () => {
    console.log(`server running on PORT ${PORT} \n`)

    await getCardsFromAPI()
})

async function getCardsFromAPI(makeImageChecks = true) {
    try {
        console.log("Fetching fresh data from API")
        const response = await axios(MARVEL_SNAP_ZONE_API)
        cachedCards = await mapCardsFromAPI(response.data.success.cards, makeImageChecks)
        console.log("✅ Done \n")
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

        let cost = cardFromAPI.cost
        
        let power = cardFromAPI.power

        let status = cardFromAPI.status

        var abilities = [] 
        cardFromAPI.tags.forEach(t => {
        if (t.tag === "No Ability")
            abilities.push("no-ability")
        })
        if (description.includes("Ongoing:")) 
            abilities.push("ongoing")
        if (description.includes("On Reveal:")) 
            abilities.push("onreveal")
        if (description.includes("Activate:"))
            abilities.push("activate")
        if (description.includes("Game Start:"))
            abilities.push("gamestart")
        if (description.includes("End of Turn:"))
            abilities.push("endofturn")
        if (abilities.length == 0) 
            abilities.push("other")

        let variants = cardFromAPI.variants.map(v => v.art)

        // if (makeImageChecks) {
        //     const promiseVariants = variants.map(async variantURL => {
        //         const isValid = await checkImageURL(variantURL)
        //         return isValid ? variantURL : ""
        //     })
        //     variants = await Promise.all(promiseVariants)
        //     variants = variants.filter(v => v !== "")
        //     console.log(`checked variants of ${name}`)
        // }   

        variants = [imageURL, ...variants]

        return {name, description, cost, power, status, abilities, variants}
    })

    return Promise.all(mappedPromiseCards)
}

app.get('/cards', async (req, res) => {
    console.log(`client called endpoint: ${req.url}`)

    let cards_filtered = filterAndSort(cachedCards, req.query)

    const clientCards = cards_filtered.map(card => ({
        name: card.name, 
        description: card.description,
        variants: card.variants
    }))
    res.json(clientCards)
})