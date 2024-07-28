// index.js //
// Airport Arrivals And Departures Information By Vincent Tseng //
// https://github.com/VincentTsengCA //
//
// This project uses the OpenSky Network API: //
// The OpenSky Network, https://opensky-network.org //
// Matthias Schäfer, Martin Strohmeier, Vincent Lenders, Ivan Martinovic and Matthias Wilhelm. //
// "Bringing Up OpenSky: A Large-scale ADS-B Sensor Network for Research". //
// In Proceedings of the 13th IEEE/ACM International Symposium on Information Processing in Sensor Networks (IPSN), pages 83-94, April 2014. //

const currentHour = new Date().getHours();

if (currentHour >= 6 && currentHour <= 19) {
    document.body.style.backgroundImage = "linear-gradient(transparent, rgb(13, 0, 49)), url('images/AirportMorning.JPG')";
}

else {
    document.body.style.backgroundImage = "linear-gradient(transparent, rgb(13, 0, 49)), url('images/AirportNight.JPG')";
}

document.addEventListener("keypress", handleUserInput);
setInterval(updateSearchingLabel, 450);

const searchBarElement = document.getElementsByClassName("SearchBar")[0];
let searchBarInFocus = false;

const searchResultsContainer = document.getElementById("SearchResultsContainer");
const searchResultsList = document.getElementById("SearchResultsList");
const filterOptionsContainer = document.getElementById("FilterOptionsContainer");
const searchingLabel = document.getElementById("SearchingLabel");
const noFlightsFoundLabel = document.getElementById("NoFlightsFoundLabel");
const sorryYesterdayLabel = document.getElementById("SorryYesterdayLabel");

const baseURL = "https://opensky-network.org/api/flights/";
const arrivalsURL = baseURL + "arrival?";
const departuresURL = baseURL + "departure?";


async function getAirportInformation(URL = arrivalsURL, airport = "") {
    let flightType = "";

    if (URL == arrivalsURL) {
        flightType = "Arrival";
    }

    else if (URL == departuresURL) {
        flightType = "Departure";
    }
    
    try {
        const response = await fetch(URL + getParameterString(airport));
        
        if (!response.ok) {
            throw new Error("Invalid Airport ICAO Indentifier: " + airport);
        }

        const data = await response.json();

        for (let i = 0; i < data.length; i++) {
            createSearchResultsItem(flightType, data[i]["icao24"], data[i]["callsign"], data[i]["estDepartureAirport"], data[i]["estArrivalAirport"], data[i]["firstSeen"], data[i]["lastSeen"]);
        }

        searchingLabel.style.display = "none";
    }

    catch(error) {
        alert(error);

        noFlightsFoundLabel.style.display = "unset";
        searchingLabel.style.display = "none";
    }
}

function getParameterString(airport = "CYYZ", begin = getCurrentUnixTime() - 259200, end = getCurrentUnixTime()) {
    return "airport=" + airport + "&begin=" + begin.toString() + "&end=" + end.toString();
}

function getCurrentUnixTime() {
    return Math.floor(Date.now() / 1000.0);
}

function getDateTime(unixTime = 0) {
    return new Date(unixTime * 1000);
}

function createSearchResultsItem(flightType = "", ICAO24 = "", callSign = "", departureAirport = "", arrivalAirport = "", firstSeen = 0, lastSeen = 0) {
    if (departureAirport == null || departureAirport == "") {
        departureAirport = "????";
    }

    if (arrivalAirport == null || arrivalAirport == "") {
        arrivalAirport = "????";
    }

    if (callSign == null || callSign == "") {
        callSign = "????????";
    }

    
    let searchResultsItem = document.createElement("div");
    searchResultsItem.className = "SearchResultsItem";


    let topResultsContainer = document.createElement("div");
    topResultsContainer.className = "TopResultsContainer";

    let callSignElement = document.createElement("a");
    callSignElement.className = "CallSign";
    callSignElement.textContent = callSign.toUpperCase();
    topResultsContainer.appendChild(callSignElement);


    let leftResultsContainer = document.createElement("div");
    leftResultsContainer.className = "LeftResultsContainer";

    let flightTypeElement = document.createElement("a");
    flightTypeElement.className = "FlightType";
    flightTypeElement.textContent = "(" + flightType + ")";
    leftResultsContainer.appendChild(flightTypeElement);

    let ICAO24Element = document.createElement("a");
    ICAO24Element.className = "ICAO24";
    ICAO24Element.textContent = "ICAO24: " + ICAO24.toUpperCase();
    leftResultsContainer.appendChild(ICAO24Element);


    let rightResultsContainer = document.createElement("div");
    rightResultsContainer.className = "RightResultsContainer";

    let departureAirportElement = document.createElement("a");
    departureAirportElement.className = "DepartureAirport";
    departureAirportElement.textContent = "🛫 " + departureAirport;
    rightResultsContainer.appendChild(departureAirportElement);

    let arrivalAirportElement = document.createElement("a");
    arrivalAirportElement.className = "ArrivalAirport";
    arrivalAirportElement.textContent = "🛬 " + arrivalAirport;
    rightResultsContainer.appendChild(arrivalAirportElement);


    let bottomResultsContainer = document.createElement("div");
    bottomResultsContainer.className = "BottomResultsContainer";

    let firstSeenElement = document.createElement("a");
    firstSeenElement.className = "FirstSeen";
    firstSeenElement.textContent = "First Seen: " + getDateTime(firstSeen).toString();
    bottomResultsContainer.appendChild(firstSeenElement);

    let lastSeenElement = document.createElement("a");
    lastSeenElement.className = "LastSeen";
    lastSeenElement.textContent = "Last Seen: " + getDateTime(lastSeen).toString();
    bottomResultsContainer.appendChild(lastSeenElement);


    searchResultsItem.appendChild(topResultsContainer);
    searchResultsItem.appendChild(leftResultsContainer);
    searchResultsItem.appendChild(rightResultsContainer);
    searchResultsItem.appendChild(bottomResultsContainer);

    searchResultsList.appendChild(searchResultsItem);
}


function handleUserInput(event) {
    if (event.key == "Enter" && searchBarInFocus && searchBarElement.value.trim() != "") {
        searchAirport();
    }
}

async function searchAirport(searchValue = searchBarElement.value.trim().toUpperCase()) {
    let existingSearchResultsItems = document.getElementsByClassName("SearchResultsItem");
    
    for (let i = existingSearchResultsItems.length - 1; i > -1; i--) {
        searchResultsList.removeChild(existingSearchResultsItems[i]);
    }

    noFlightsFoundLabel.style.display = "none";
    sorryYesterdayLabel.style.display = "none";

    searchResultsContainer.style.display = "block";
    filterOptionsContainer.style.display = "block";
    searchingLabel.style.display = "unset";

    window.scrollTo(0, 450);

    await getAirportInformation(arrivalsURL, searchValue);
    filterResults();

    noFlightsFoundLabel.style.display = "none";
    searchingLabel.style.display = "unset";
    
    await getAirportInformation(departuresURL, searchValue);
    filterResults();
}

function updateSearchingLabel() {
    searchingLabel.textContent += ".";

    if (searchingLabel.textContent.length >= 13) {
        searchingLabel.textContent = "Searching";
    }
}

function setFilterOption(filterOption = "", forceTrue = false) {
    let filterToChange = document.getElementById(filterOption);

    if (filterToChange.className == "FilterOption" || forceTrue) {
        filterToChange.className = "EnabledFilterOption";
    }

    else {
        filterToChange.className = "FilterOption";
    }

    filterResults();
}

function filterResults() {
    let arrivalsOn = document.getElementById("ArrivalsFilterOption").className == "EnabledFilterOption";
    let departuresOn = document.getElementById("DeparturesFilterOption").className == "EnabledFilterOption";
    let todayOn = document.getElementById("TodayFilterOption").className == "EnabledFilterOption";
    let yesterdayOn = document.getElementById("YesterdayFilterOption").className == "EnabledFilterOption";

    let searchResultsItems = document.getElementsByClassName("SearchResultsItem");
    
    let today = new Date().getDate();
    let yesterday = new Date(); yesterday.setDate(today - 1); yesterday = yesterday.getDate();

    noFlightsFoundLabel.style.display = "none";
    sorryYesterdayLabel.style.display = "none";

    for (let i = 0; i < searchResultsItems.length; i++) {
        searchResultsItems[i].style.display = "block";
    }

    for (let i = 0; i < searchResultsItems.length; i++) {
        let searchResultDate = new Date(searchResultsItems[i].childNodes[3].firstChild.textContent).getDate();

        if (!arrivalsOn && searchResultsItems[i].childNodes[1].firstChild.textContent == "(Arrival)") {
            searchResultsItems[i].style.display = "none";
        }

        if (!departuresOn && searchResultsItems[i].childNodes[1].firstChild.textContent == "(Departure)") {
            searchResultsItems[i].style.display = "none";
        }

        if (searchResultDate != today && searchResultDate != yesterday) {
            searchResultsItems[i].style.display = "none";
        }

        if (!todayOn && searchResultDate == today) {
            searchResultsItems[i].style.display = "none";
        }

        if (!yesterdayOn && searchResultDate == yesterday) {
            searchResultsItems[i].style.display = "none";
        }
    }

    for (let i = 0; i < searchResultsItems.length; i++) {
        if (searchResultsItems[i].style.display == "block") {
            return;
        }
    }

    if (arrivalsOn && yesterdayOn && !departuresOn && !todayOn) {
        sorryYesterdayLabel.style.display = "unset";
    }

    else {
        noFlightsFoundLabel.style.display = "unset";
    }
}

function onNavigationArrivalsClicked() {
    if (filterOptionsContainer.style.display == "none") {
        window.scrollTo(0, 150);
        document.getElementsByClassName('SearchBar')[0].focus();
    }

    else {
        window.scrollTo(0, 350);
        setFilterOption("ArrivalsFilterOption", true);
    }
}

function onNavigationDeparturesClicked() {
    if (filterOptionsContainer.style.display == "none") {
        window.scrollTo(0, 150);
        document.getElementsByClassName('SearchBar')[0].focus();
    }

    else {
        window.scrollTo(0, 350);
        setFilterOption("DeparturesFilterOption", true);
    }
}

function onSearchBarFocus() {
    searchBarInFocus = true;

    searchBarElement.animate(
        { width: "100%" },
        { duration: 1250, iterations: 1, easing: "ease", fill: "forwards" }
    )
}

function onSearchBarUnfocus() {
    searchBarInFocus = false;

    searchBarElement.animate(
        { width: "50%" },
        { duration: 1250, iterations: 1, easing: "ease", fill: "forwards" }
    )
}
