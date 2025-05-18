// when clicking on bigCardImage, bigCardName, bigCardDescription, buttons (which are inside 
// cardInformationBackground) then we don't want to close card information page
bigCardImage.addEventListener("click", (e) => {e.stopPropagation()})
bigCardName.addEventListener("click", (e) => {e.stopPropagation()})
bigCardDescription.addEventListener("click", (e) => {e.stopPropagation()})
variantButtonContainer.addEventListener("click", (e) => {e.stopPropagation()})
document.querySelectorAll(".prev-next-card-buttons").forEach(button => {
    button.addEventListener("click", (e) => {e.stopPropagation()})
})

// handling key interaction
document.addEventListener("keydown", (e) => {

    if (cardInformationBackground.style.display === "block") {
        if (e.key === "ArrowUp") {
            clickNextVariantButton("up")
            nextVariantButton.classList.remove("arrow-button-not-hover")
            nextVariantButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowRight") {
            clickNextCardButton("right")
            nextCardButton.classList.remove("arrow-button-not-hover")
            nextCardButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowDown") {
            clickNextVariantButton("down")
            prevVariantButton.classList.remove("arrow-button-not-hover")
            prevVariantButton.classList.add("arrow-button-hover")
        } else if (e.key === "ArrowLeft") {
            clickNextCardButton("left")
            prevCardButton.classList.remove("arrow-button-not-hover")
            prevCardButton.classList.add("arrow-button-hover")
        }

        if (e.key === "Escape") {
            turnOffCardInformation()
        }
    }
})

document.addEventListener("keyup", (e) => {

    if (cardInformationBackground.style.display === "block") {
        if (e.key === "ArrowUp") {
            nextVariantButton.classList.add("arrow-button-not-hover")
            nextVariantButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowRight") {
            nextCardButton.classList.add("arrow-button-not-hover")
            nextCardButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowDown") {
            prevVariantButton.classList.add("arrow-button-not-hover")
            prevVariantButton.classList.remove("arrow-button-hover")
        } else if (e.key === "ArrowLeft") {
            prevCardButton.classList.add("arrow-button-not-hover")
            prevCardButton.classList.remove("arrow-button-hover")
        }
    }
})

searchField.querySelector("input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        applyFilter(true)
    }
})

sortContainer.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
        greyOutApplyButton(false)
    })
})

// adding change events to all ALL-buttons in the filter container
document.querySelectorAll(".input-all").forEach(inp => {
    inp.addEventListener("change", () => {
        let container
        if (inp.id === "cost-all") {
            container = costContainer
        } else if (inp.id === "power-all") {
            container = powerContainer
        } else if (inp.id === "ability-all") {
            container = abilityContainer
        } else if (inp.id === "status-all") {
            container = statusContainer
        }

        container.querySelector(".checkbox-container").querySelectorAll("input").forEach(i => {
            if (!inp.checked) { // before clicking input was checked 
                i.checked = false
            } else { // before clicking input was not checked 
                i.checked = true
            }
        })

        greyOutApplyButton(false)
    })
})

// adding change events to all normal checkboxes in filter container
document.querySelectorAll(".input-check").forEach(inp => {
    inp.addEventListener("change", () => {

        let allButton
        let container
        if (inp.dataset.container === "cost") {
            allButton = document.getElementById("cost-all")
            container = costContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "power") {
            allButton = document.getElementById("power-all")
            container = powerContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "ability") {
            allButton = document.getElementById("ability-all")
            container = abilityContainer.querySelector(".checkbox-container")
        } else if (inp.dataset.container === "status") {
            allButton = document.getElementById("status-all")
            container = statusContainer.querySelector(".checkbox-container")
        }

        if (!inp.checked) { // before clicking input was checked
            allButton.checked = false
        } else { // before clicking input was not checked
            let all_inputs_checked = true
            container.querySelectorAll("input").forEach(i => {
                if (!i.checked) 
                    all_inputs_checked = false
            })
            if (all_inputs_checked) 
                allButton.checked = true
        }

        greyOutApplyButton(false)
    })
})

window.addEventListener("popstate", e => {
    handleQueryParams()
})