export async function checkImageURL(imageURL) {
    try {
        const imageResponse = await fetch(imageURL, { method: "HEAD" })
        return imageResponse.ok
    } catch(error) {
        return false
    }
}

export function filter_function(card, search, costs, powers, abilities, status) {
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

export function sort_function(card1, card2, sorting, direction) {
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