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

                var cost = card.cost 

                var power = card.power 

                var status = card.status

                var abilities = [] 
                card.tags.forEach(t => {
                    if (t.tag === "No Ability")
                        abilities.push("no-ability")
                })
                if (description.includes("Ongoing:")) 
                    abilities.push("ongoing")
                if (description.includes("On Reveal:")) 
                    abilities.push("on-reveal")
                if (abilities.length == 0) 
                    abilities.push("other")

                cards.push({name, description, imageURL, cost, power, abilities, status})
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
            search_result.push(card)
        }
    })

    res.json(search_result)
})

function filter_function(card, costs, powers, abilities, status) {
    let passed = true
    if (!costs.includes(card.cost) || !powers.includes(card.power) || !status.includes(card.status)) {
        passed = false
    }

    // intersection between card.abilities and abilities
    const intersection = abilities.filter(a => card.abilities.includes(a))
    if (intersection.length == 0) {
        passed = false
    }

    return passed
}

function sort_function(card1, card2, sorting, direction) {
    if (sorting === "name") {
        if (direction === "up") 
            return card1.name.localeCompare(card2.name)
        else if (direction === "down")
            return card2.name.localeCompare(card1.name)

    } else if (sorting === "cost") {
        if (direction === "up")
            return card1.cost - card2.cost
        else if (direction === "down") 
            return card2.cost - card1.cost

    } else if (sorting === "power") {
        if (direction === "up")
            return card1.power - card2.power
        else (direction === "down") 
            return card2.power - card1.power
    }
}

app.get("/cards/filter/:cost/:power/:ability/:status/:sorting/:direction", (req, res) => {
    const cost_string = req.params.cost 
    const power_string = req.params.power 
    const ability_string = req.params.ability 
    const status_string = req.params.status 
    const sorting = req.params.sorting 
    const direction = req.params.direction

    const costs = cost_string.split(",").map(n => parseInt(n, 10))
    const powers = power_string.split(",").map(n => parseInt(n, 10))
    const abilities = ability_string.split(",")
    const status = status_string.split(",")

    let cards_filtered = cards.filter(card => filter_function(card, costs, powers, abilities, status))

    cards_filtered = cards_filtered.sort((a,b) => sort_function(a, b, sorting, direction))

    res.json(cards_filtered)
})