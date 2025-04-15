const express = require("express")
const axios = require("axios")

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
            response.data.success.cards.forEach((card, index) => {
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
                if (description.includes("Activate:"))
                    abilities.push("activate")
                if (description.includes("Game Start:"))
                    abilities.push("game-start")
                if (description.includes("End of Turn:"))
                    abilities.push("end-of-turn")
                if (abilities.length == 0) 
                    abilities.push("other")

                var variants = []
                variants.push(imageURL)
                card.variants.forEach(v => {
                    variants.push(v.art)
                })

                //console.log(`${index}: ${name}`)

                cards.push({name, description, imageURL, cost, power, abilities, status, variants})
            })
        })
        .catch(error => console.log(error.message))
}

app.get('/cards', (req, res) => {
    res.json(cards)
});

function filter_function(card, search, costs, powers, abilities, status) {
    let passed = true

    if (search != "all" && !card.name.toUpperCase().includes(search.toUpperCase()))
        passed = false

    if (costs != "all"){
        costs = costs.split(",").map(n => parseInt(n, 10))
        if (!costs.includes(card.cost))
            passed = false
    }

    if (powers != "all"){
        powers = powers.split(",").map(n => parseInt(n, 10))
        if (!powers.includes(card.power))
            passed = false
    }

    if (status != "all"){
        status = status.split(",")
        if (!status.includes(card.status))
            passed = false
    }


    if (abilities != "all"){
        // intersection between card.abilities and abilities
        abilities = abilities.split(",")
        const intersection = abilities.filter(a => card.abilities.includes(a))
        if (intersection.length == 0) {
            passed = false
        }
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

app.get("/cards/filter", (req, res) => {
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

    let cards_filtered = cards.filter(card => filter_function(card, search_string, cost_string, power_string, ability_string, status_string))

    cards_filtered = cards_filtered.sort((c1, c2) => sort_function(c1, c2, sorting_string, direction_string))

    // console.log({search_string, cost_string, power_string, ability_string, status_string, sorting_string, direction_string})
    res.json(cards_filtered)
})