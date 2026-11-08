const destinations = {
    bali: { name: "Bali, Indonesia", shortName: "Bali", dailyCost: 120, roomRate: 250, flight: 780 },
    paris: { name: "Paris, France", shortName: "Paris", dailyCost: 190, roomRate: 340, flight: 1650 },
    tokyo: { name: "Tokyo, Japan", shortName: "Tokyo", dailyCost: 170, roomRate: 290, flight: 1150 },
    santorini: { name: "Santorini, Greece", shortName: "Santorini", dailyCost: 165, roomRate: 360, flight: 1720 },
    maldives: { name: "Maldives", shortName: "the Maldives", dailyCost: 210, roomRate: 520, flight: 1350 },
    dubai: { name: "Dubai, UAE", shortName: "Dubai", dailyCost: 175, roomRate: 310, flight: 1250 },
    queenstown: { name: "Queenstown, New Zealand", shortName: "Queenstown", dailyCost: 150, roomRate: 260, flight: 480 },
    goldcoast: { name: "Gold Coast, Australia", shortName: "the Gold Coast", dailyCost: 110, roomRate: 210, flight: 260 }
};

const travelStyles = {
    budget: { label: "Budget", multiplier: 0.75 },
    standard: { label: "Standard", multiplier: 1 },
    luxury: { label: "Luxury", multiplier: 1.6 }
};

const moneyFormat = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
});

const tripForm = document.querySelector("#trip-form");
const destinationSelect = document.querySelector("#destination");
const travellersInput = document.querySelector("#travellers");
const daysInput = document.querySelector("#days");
const flightsCheckbox = document.querySelector("#include-flights");
const resultCard = document.querySelector("#result-card");
const resultTotal = document.querySelector("#result-total");
const resultSummary = document.querySelector("#result-summary");
const resultBreakdown = document.querySelector("#result-breakdown");

function fillDestinationList() {
    Object.keys(destinations).forEach(function (key) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = destinations[key].name;
        destinationSelect.appendChild(option);
    });
}

function fillRatesTable() {
    const tableBody = document.querySelector("#rates-body");

    Object.keys(destinations).forEach(function (key) {
        const place = destinations[key];
        const row = document.createElement("tr");
        row.innerHTML =
            "<th scope=\"row\">" + place.name + "</th>" +
            "<td>" + moneyFormat.format(place.dailyCost) + "</td>" +
            "<td>" + moneyFormat.format(place.roomRate) + "</td>" +
            "<td>" + moneyFormat.format(place.flight) + "</td>";
        tableBody.appendChild(row);
    });
}

function showError(field, message) {
    const errorBox = document.querySelector("#" + field.id + "-error");
    field.setAttribute("aria-invalid", "true");
    errorBox.textContent = message;
}

function clearError(field) {
    const errorBox = document.querySelector("#" + field.id + "-error");
    field.removeAttribute("aria-invalid");
    errorBox.textContent = "";
}

function checkWholeNumber(field, smallest, largest, name) {
    const value = Number(field.value);

    if (field.value.trim() === "") {
        showError(field, "Please enter the number of " + name + ".");
        return false;
    }

    if (!Number.isInteger(value) || value < smallest || value > largest) {
        showError(field, "Please enter a whole number between " + smallest + " and " + largest + ".");
        return false;
    }

    clearError(field);
    return true;
}

function checkTripForm() {
    let isValid = true;

    if (destinationSelect.value === "") {
        showError(destinationSelect, "Please choose a destination.");
        isValid = false;
    } else {
        clearError(destinationSelect);
    }

    if (!checkWholeNumber(travellersInput, 1, 20, "travellers")) {
        isValid = false;
    }

    if (!checkWholeNumber(daysInput, 1, 60, "days")) {
        isValid = false;
    }

    return isValid;
}

function calculateTripCost(place, travellers, days, style, includeFlights) {
    const rooms = Math.ceil(travellers / 2);
    const dailyExpenses = place.dailyCost * travellers * days;
    const accommodation = place.roomRate * rooms * days;
    const baseCost = dailyExpenses + accommodation;
    const styleCost = baseCost * style.multiplier;
    const flights = includeFlights ? place.flight * travellers : 0;

    return {
        rooms: rooms,
        dailyExpenses: dailyExpenses,
        accommodation: accommodation,
        styleAdjustment: styleCost - baseCost,
        flights: flights,
        total: Math.round(styleCost + flights)
    };
}

function plural(number, word) {
    return number + " " + word + (number === 1 ? "" : "s");
}

function showResult(place, travellers, days, style, cost) {
    const adjustmentText = cost.styleAdjustment === 0
        ? moneyFormat.format(0)
        : (cost.styleAdjustment > 0 ? "+ " : "- ") + moneyFormat.format(Math.abs(cost.styleAdjustment));

    resultTotal.textContent = moneyFormat.format(cost.total);
    resultSummary.textContent =
        "Estimated cost for " + plural(travellers, "traveller") +
        " to " + place.shortName + " for " + plural(days, "day") + ": " +
        moneyFormat.format(cost.total) + " – " + style.label + " Travel Package.";

    resultBreakdown.innerHTML =
        "<li><span>Daily expenses (" + plural(travellers, "traveller") + " × " + plural(days, "day") + ")</span><span>" + moneyFormat.format(cost.dailyExpenses) + "</span></li>" +
        "<li><span>Accommodation (" + plural(cost.rooms, "room") + " × " + plural(days, "night") + ")</span><span>" + moneyFormat.format(cost.accommodation) + "</span></li>" +
        "<li><span>" + style.label + " style adjustment (×" + style.multiplier + ")</span><span>" + adjustmentText + "</span></li>" +
        "<li><span>Return flights</span><span>" + (cost.flights > 0 ? moneyFormat.format(cost.flights) : "Not included") + "</span></li>";

    resultCard.classList.remove("is-updated");
    void resultCard.offsetWidth;
    resultCard.classList.add("is-updated");
}

tripForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!checkTripForm()) {
        tripForm.querySelector("[aria-invalid='true']").focus();
        return;
    }

    const place = destinations[destinationSelect.value];
    const travellers = Number(travellersInput.value);
    const days = Number(daysInput.value);
    const style = travelStyles[tripForm.elements["travel-style"].value];
    const cost = calculateTripCost(place, travellers, days, style, flightsCheckbox.checked);

    showResult(place, travellers, days, style, cost);
});

tripForm.addEventListener("reset", function () {
    [destinationSelect, travellersInput, daysInput].forEach(clearError);
    resultTotal.textContent = moneyFormat.format(0);
    resultSummary.textContent = "Fill in your trip details and press Calculate to see your estimate.";
    resultBreakdown.innerHTML = "";
});

fillDestinationList();
fillRatesTable();
