// collapses and extends the filter container
function switchFilter() {
    if (!filter_is_collapsed) {
        filterContainer.style.transition = "max-height 1s, border 0.3s 0.5s, margin 0.2s 0.6s, padding 0.2s 0.6s"
        filterContainer.style.maxHeight = null
        filterContainer.style.border = "0px solid white"
        filterContainer.style.margin = "0px 30px 0px 30px"
        filterContainer.style.padding = "0px 10px 0px 10px"
    } else {
        filterContainer.style.transition = "max-height 1s"
        filterContainer.style.maxHeight = (filterContainer.scrollHeight + 50) + "px"
        // filterContainer.style.maxHeight = "600px"
        filterContainer.style.border = "5px solid white"
        filterContainer.style.borderBottom = "none"
        filterContainer.style.margin = "0px 30px -30px 30px"
        filterContainer.style.padding = "0px 10px 40px 10px"
    }
    filter_is_collapsed = !filter_is_collapsed
}

// rotates the direction arrow in filter container
function rotateDirArrow() {
    arrowPointingDown = !arrowPointingDown
    sortDirection.style.transform = `rotate(${arrowPointingDown ? 180 : 0}deg)`
    greyOutApplyButton(false)
}

function greyOutApplyButton(enable){
    filter_greyed_out = enable
    if (enable){
        applyButton.style.filter = "blur(1px) grayscale(100%)"
        applyButton.style.opacity = "0.6"
    } else {
        applyButton.style.filter = "blur(0px) grayscale(0%)"
        applyButton.style.opacity = "1"
    }
}

function applyFilter(search_field) {
    if (!filter_greyed_out || search_field) {
        greyOutApplyButton(true)

        let search_string = ""
        let cost_string = ""
        let power_string = ""
        let ability_string = ""
        let status_string = ""
        let sorting_string = ""
        let direction_string = ""

        // read search field value
        search_string = searchField.querySelector("input").value

        // read checked cost buttons
        if (costContainer.querySelector("#cost-all").checked) {
            cost_string = "all"
        } else {
            costContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked) {
                    // every id has format cost0, cost1, cost2, ... so we just cut away cost to get the number
                    cost_string += inp.id.substring(4,inp.id.length) + ","
                }
            })
            if (cost_string.includes("6,")){
                cost_string += "7,8"
            }
        }
        
        // read checked power buttons
        if (powerContainer.querySelector("#power-all").checked) {
            power_string = "all"
        } else {
            powerContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked) {
                    // every id has format power0, power1, power2, ... so we just cut away cost to get the number
                    power_string += inp.id.substring(5,inp.id.length) + ","
                }
            })
            if (power_string.includes("-,")){
                for (let i = -10; i <= -1; i++)
                    power_string += i.toString() + ","
            }
            if (power_string.includes("+,")){
                for (let i = 11; i <= 20; i++)
                    power_string += i.toString() + ","
            }
            power_string = power_string.replaceAll("+,", "").replaceAll("-,", "")
        }

        // read checked ability buttons
        if (abilityContainer.querySelector("#ability-all").checked) {
            ability_string = "all"
        } else {
            abilityContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked){
                    ability_string += inp.id + "," 
                }
            })
        }

        // read checked status buttons
        if (statusContainer.querySelector("#status-all").checked) {
            status_string = "all"
        } else {
            statusContainer.querySelectorAll(".checkbox-container input").forEach(inp => {
                if (inp.checked){
                    status_string = inp.id + ","
                }
            })
        }

        // read sorting preference
        const nameRadio = document.getElementById("name")
        const costRadio = document.getElementById("cost")
        const powerRadio = document.getElementById("power")
        if (nameRadio.checked == true) 
            sorting_string = "name"
        else if (costRadio.checked == true) 
            sorting_string = "cost"
        else if (powerRadio.checked == true) 
            sorting_string = "power"
        
        // read direction of sorting preference
        if (arrowPointingDown) 
            direction_string = "down"
        else 
            direction_string = "up"

        if (cost_string === "" || power_string === "" || ability_string === "" || status_string === "") {
            filterWarning.querySelector("p").style.display = "block"
        } else {
            filterWarning.querySelector("p").style.display = "none"

            cardList.innerHTML = ""
            const url = "http://localhost:8000/cards/filter?search=" + search_string + "&cost=" + cost_string + "&power=" + power_string + "&ability=" + 
                        ability_string + "&status=" + status_string + "&sorting=" + sorting_string + "&direction=" + direction_string
            fillCardsList(url, false)
        }
    }
}