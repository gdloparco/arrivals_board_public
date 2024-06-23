const airportCodeForm = document.getElementById('airportCodeForm');

airportCodeForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const airportCodeInput = document.getElementById('airportCodeInput').value;
    if (airportCodeInput.length !== 3) {
        console.error('Invalid Airport IATA CODE. IATA CODEs are composed of three letters.');
        return;
    }

    fetch(`https://arrivals-board.onrender.com/flights?airport_code=${airportCodeInput}`)
        // fetch(`full-data.json`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Request limit reached. Please try again in 30 minutes.');
                } else {
                    throw new Error('Failed to fetch flight data');
                }
            }
            return response.json();
        })
        .then(data => {
            const filteredData = filterFlights(data);
            const dataDisplay = document.getElementById("dataDisplay");
            dataDisplay.innerHTML = ''; // Clear previous data

            const boardName = document.getElementById("boardTitle");
            boardName.textContent = filteredData[1].destination.name.toUpperCase();
            const timeAtAirport = document.getElementById("timeAtAirport");
            let localTimeNow = moment.tz(filteredData[1].destination.timezone);
            let localDateNow = localTimeNow.format('YYYY-MM-DD HH:mm:ss');
            timeAtAirport.textContent = localDateNow

            createHeader()
            filteredData.sort((a, b) => new Date(a.scheduled_in) - new Date(b.scheduled_in));
            filteredData.forEach(flight => {
                const flightInfo = document.createElement("div");
                flightInfo.classList.add("flight-info");

                const flightNumber = document.createElement("p");
                flightNumber.textContent = flight.ident_iata;

                const origin = document.createElement("p");
                origin.textContent = flight.origin.city + " (" + flight.origin.code_iata + ")";

                const scheduledTime = document.createElement("p");
                const formattedTime = convertToTimezone(flight.destination.timezone, flight.scheduled_in);
                scheduledTime.textContent = formattedTime;

                const status = document.createElement("p");
                // console.log(flight.ident_iata)
                const calculatedStatus = calculateStatus(flight.destination.timezone, flight.cancelled, flight.scheduled_in, flight.estimated_in, flight.actual_in);
                status.textContent = calculatedStatus;
                if (calculatedStatus.includes("Delayed") || calculatedStatus.includes("Cancelled")) {
                    status.classList.add("delayed-status");
                }

                flightInfo.appendChild(flightNumber);
                flightInfo.appendChild(origin);
                flightInfo.appendChild(scheduledTime);
                flightInfo.appendChild(status);


                dataDisplay.appendChild(flightInfo);
            });
        })
        .catch(error => {
            console.error('Error fetching flight data:', error.message);

            let errorMessage;

            if (error.message.includes('Cannot read properties of undefined')) {
                errorMessage = document.createElement('h3');
                errorMessage.textContent = 'The input provided is not a valid IATA Code. Try again.';
                errorMessage.classList.add('error-message');
            } else {
                errorMessage = document.createElement('h3');
                errorMessage.textContent = error.message;
                errorMessage.classList.add('error-message');
            }

            dataDisplay.innerHTML = '';
            dataDisplay.appendChild(errorMessage);
        });
});

function filterFlights(data) {
    return data.filter(flight => {
        return flight.ident_iata !== null && flight.scheduled_in !== null;
    });
}

function formatTime(timestamp) {
    const date = moment(timestamp);
    const formattedTime = date.format('HH:mm');
    return formattedTime;
}

function createHeader() {

    const header = document.createElement("div");
    header.classList.add("board-header");
    const flightN = document.createElement("p");
    flightN.textContent = "Flight N°"
    const origin = document.createElement("p");
    origin.textContent = "Origin";
    const scheduled = document.createElement("p");
    scheduled.textContent = "Scheduled";
    const status = document.createElement("p");
    status.textContent = "Status";

    header.appendChild(flightN);
    header.appendChild(origin);
    header.appendChild(scheduled);
    header.appendChild(status);

    dataDisplay.appendChild(header);
};

function calculateStatus(APItimezone, cancelled, scheduled, estimated, actual) {
    let localTimeNow = moment.tz(APItimezone);
    let localDateNow = localTimeNow.toISOString(); // Format current time as "yyyy-mm-ddTHH:MM:SSZ"
    let localScheduled = moment(scheduled).tz(APItimezone).toISOString()
    let localEstimated = moment(estimated).tz(APItimezone).toISOString()
    let HMestimated = convertToTimezone(APItimezone, estimated);
    let HMscheduled = convertToTimezone(APItimezone, scheduled);
    let HMactual = convertToTimezone(APItimezone, actual);
    // console.log(scheduled)
    // console.log(estimated)
    // console.log(actual)


    if (cancelled) {
        return "Cancelled";
    } else if (actual !== "") {
        // console.log(actual)
        // console.log(HMactual)
        return `Landed: ${HMactual}`;
    } else if (estimated !== "") {
        let landed = localEstimated <= localDateNow;
        let delayed = localScheduled <= localEstimated;
        if (landed) {
            // console.log(HMestimated)
            return `Landed: ${HMestimated}`;
        } else if (delayed) {
            // console.log(HMestimated)
            return `Delayed: ${HMestimated}`;
        } else {
            // console.log(HMestimated)
            return `Expected: ${HMestimated}`;
        }
    } else if (scheduled !== "") {
        let landed = localScheduled <= localDateNow;
        if (landed) {
            // console.log(HMscheduled)
            return `Landed: ${HMscheduled}`;
        } else {
            // console.log(HMscheduled)
            return `Expected: ${HMscheduled}`;
        }
    } else {
        return "Unavailable";
    }
}

function convertToTimezone(timezone, timestamp) {
    // console.log(timestamp)
    // console.log(timezone)
    if (!timestamp) {
        return "";
    }

    const localTime = moment(timestamp).tz(timezone);
    const localTimeHM = localTime.format('HH:mm');
    // console.log(localTimeHM)
    return localTimeHM;
}