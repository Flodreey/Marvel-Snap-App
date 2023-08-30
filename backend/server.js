const express = require("express")
const axios = require("axios")
const cheerio = require("cherio")
const fs = require("fs")
const async = require("async")

const app = express()

const cors = require("cors")
app.use(cors())

const PORT = 8000
const MARVEL_SNAP_ZONE_API = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true"

var cards = []

app.listen(PORT, () => {
    console.log("server running on PORT ", PORT)
    main()
})

function main() {
    axios(MARVEL_SNAP_ZONE_API)
        .then(response => {
            //console.log(response.data.success.cards[0])
            response.data.success.cards.forEach(card => {
                var name = card.name

                var description = "None"
                if (card.ability != "")
                    description = card.ability
                else if (card.flavor != "") 
                    description = card.flavor
                // else 
                //     console.log(card.name + " has no ability and no flavor")
                description = description.replaceAll("<span>", "").replaceAll("</span>", "")

                var imageURL = card.art

                cards.push({name, description, imageURL})
            })
        })
        .catch(error => console.log(error.message))
}

app.get('/cards', (req, res) => {
    res.json(cards)
});

app.get('/cards/search/', (req, res) => {
    res.json(cards)
});

app.get("/cards/search/:search", (req, res) => {
    const search_value = req.params.search.toUpperCase()
    let search_result = []

    cards.forEach(card => {
        const upperCaseName = card.name.toUpperCase()
        if (upperCaseName.includes(search_value)){
            search_result.push({name: card.name, description: card.description, imageURL: card.imageURL})
        }
    })

    res.json(search_result)
})