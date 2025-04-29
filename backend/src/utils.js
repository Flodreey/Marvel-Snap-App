export async function checkImageURL(imageURL) {
    try {
        const imageResponse = await fetch(imageURL, { method: "HEAD" })
        return imageResponse.ok
    } catch(error) {
        return false
    }
}

export function filterAndSort(cardsArray, query) {
    const { 
        search, 
        costArray, 
        powerArray, 
        abilityArray, 
        statusArray, 
        sorting, 
        direction 
    } = parseReqestQuery(query)

    // console.log(`search: ${search}`)
    // console.log(`costArray:`)
    // console.log(costArray)
    // console.log(`powerArray:`)
    // console.log(powerArray)
    // console.log(`abilityArray:`)
    // console.log(abilityArray)
    // console.log(`statusArray:`)
    // console.log(statusArray)
    // console.log(`sorting: ${sorting}`)
    // console.log(`direction: ${direction}`)

    let result = cardsArray
        .filter(card => {
            if (search != "" && !card.name.toLowerCase().includes(search.toLowerCase())) {
                return false
            }

            if (costArray.length != 0 && !costArray.includes(card.cost)) {
                return false
            }

            if (powerArray.length != 0 && !powerArray.includes(card.power)) {
                return false
            }

            if (statusArray.length != 0 && !statusArray.includes(card.status)) {
                return false
            }

            if (abilityArray.length != 0 && !abilityArray.some(a => card.abilities.includes(a))) {
                return false
            }

            return true
        }).sort((card1, card2) => {
            switch(sorting) {
                case "name":
                    return (direction === "up") 
                        ? card1.name.localeCompare(card2.name)
                        : card2.name.localeCompare(card1.name)
                case "cost":
                    return (direction === "up")
                        ? card1.cost - card2.cost
                        : card2.cost - card1.cost
                case "power":
                    return (direction === "up")
                        ? card1.power - card2.power
                        : card2.power - card1.power
            }
        })

    return result
}

export function parseReqestQuery(query) {
    let search = query.search ?? ""

    let costArray = []
    if (query.cost) {
        costArray = query.cost.split(",").map(n => parseInt(n, 10)).filter(n => !isNaN(n))
    }

    let powerArray = []
    if (query.power) {
        powerArray = query.power.split(",").map(n => parseInt(n, 10)).filter(n => !isNaN(n))
    }

    let abilityArray = []
    if (query.ability) {
        abilityArray = query.ability.split(",").map(s => s.trim().toLowerCase())
    }
    
    let statusArray = []
    if (query.status) {
        statusArray = query.status.split(",").map(s => s.trim().toLowerCase())
    }

    let sorting = "name"
    if (["name", "cost", "power"].includes(query.sorting)) {
        sorting = query.sorting
    }

    let direction = "up"
    if (["up", "down"].includes(query.direction)) {
        direction = query.direction
    }

    return { search, costArray, powerArray, abilityArray, statusArray, sorting, direction }
}