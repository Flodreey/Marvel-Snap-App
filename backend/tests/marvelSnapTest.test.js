const parseReqestQuery = require("../src/utils.js").parseReqestQuery

test("parseReqestQuery", () => {
    const query1 = {
        search: "do",
        cost: "0-1-2-3-4-5",
        power: "1-2-3",
        ability: "activate-gameStart-endOfTurn",
        status: "released",
        sorting: "cost",
        direction: "down"
    }
    const result1 = parseReqestQuery(query1)
    expect(result1.search).toBe("do")
    expect(result1.costArray).toEqual([0, 1, 2, 3, 4, 5])
    expect(result1.powerArray).toEqual([1, 2, 3])
    expect(result1.abilityArray).toEqual(["activate", "gamestart", "endofturn"])
    expect(result1.statusArray).toEqual(["released"])
    expect(result1.sorting).toBe("cost")
    expect(result1.direction).toBe("down")

    const query2 = {
        cost: "0-1-gt6",
        power: "lt0-5-gt10",
    }
    const result2 = parseReqestQuery(query2)
    expect(result2.search).toBe("")
    expect(result2.costArray).toEqual([0, 1, 7, 8, 9, 10])
    expect(result2.powerArray).toEqual([5, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(result2.abilityArray).toEqual([])
    expect(result2.statusArray).toEqual([])
    expect(result2.sorting).toBe("name")
    expect(result2.direction).toBe("up")

    const query3 = {
        cost: "a-1-2-b-5",
        power: "a-1-2-b-5",
    }
    const result3 = parseReqestQuery(query3)
    expect(result3.costArray).toEqual([1, 2, 5])
    expect(result3.powerArray).toEqual([1, 2, 5])
})

const filterAndSort = require("../src/utils.js").filterAndSort
const testCards = require("./testCards.js")

test("filterAndSort", () => {
    const query1 = {
        cost: "0-1",
        power: "1-2",
        ability: "activate",
        status: "unreleased",
        sorting: "cost",
        direction: "up"
    }
    const result1 = filterAndSort(testCards, query1)
    for (let i = 0; i < result1.length; i++) {
        expect([0, 1]).toContain(result1[i].cost)
        expect([1, 2]).toContain(result1[i].power)
        expect(result1[i].ability.toLowerCase()).toContain("activate")
        expect(result1[i].status).toBe("unreleased")
        if (i < result1.length - 1) 
            expect(result1[i].cost).toBeLessThanOrEqual(result1[i + 1].cost)
    }

    const query2 = {
        search: "da",
    }
    const result2 = filterAndSort(testCards, query2)
    for (let i = 0; i < result2.length; i++) {
        expect(result2[i].name.toLowerCase()).toContain("da")
    }

    const query3 = {
        status: "released",
        sorting: "power",
        direction: "down"
    }
    const result3 = filterAndSort(testCards, query3)
    for (let i = 0; i < result3.length; i++) {
        expect(result3[i].status).toBe("released")
        if (i < result3.length - 1) {
            expect(result3[i].power).toBeGreaterThanOrEqual(result3[i + 1].power)
        }
    }

    const query4 = {
        cost: "gt6",
        sorting: "name",
        direction: "up"
    }
    const result4 = filterAndSort(testCards, query4)
    for (let i = 0; i < result4.length - 1; i++) {
        expect(result4[i].cost).toBeGreaterThan(6)
        if (i < result4.length - 1)
            expect(result4[i].name.localeCompare(result4[i + 1].name)).toBeLessThanOrEqual(0)
    }

    const query5 = {
        power: "lt0",
        sorting: "power",
        direction: "down"
    }
    const result5 = filterAndSort(testCards, query5)
    for (let i = 0; i < result5.length - 1; i++) {
        expect(result5[i].power).toBeLessThanOrEqual(-1)
        if (i < result5.length - 1)
            expect(result5[i].power).toBeGreaterThanOrEqual(result5[i + 1].power)
    }

    const query6 = {}
    const result6 = filterAndSort(testCards, query6)
    expect(Array.isArray(result6)).toBe(true)
})

