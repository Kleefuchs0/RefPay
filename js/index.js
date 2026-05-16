function evaluateCompensations(data) {
    switch (data.settings.scenario) {
        case 'einzelspiel':
            data.evaluated.compensations.referee = 70;
            data.evaluated.compensations.other = 60;
            break;
        case 'turnier6':
            data.evaluated.compensations.referee = 70;
            data.evaluated.compensations.other = 70;
            break;
        case 'turnier6plus':
            data.evaluated.compensations.referee = 90;
            data.evaluated.compensations.other = 90;
            break;
    }
    data.evaluated.compensations.jugendspiel = data.settings.isJugendSpiel ? 25 : 0;
}

function calculateResultingValues(data) {
    // Calculates the motor-vehicle costs of the two vehicles which drive the furthest distance.
    const totalDrivenKilometers = data.resulting.people.reduce((sum, person) => sum + person.kilometer, 0);
    const topDrivers = getTopDrivers(data.settings.crewSize, data.resulting.people);
    const totalKilometersTopDrivers = getTotalKilometersTopDrivers(topDrivers);
    const totalCostInCentsKFZ = totalKilometersTopDrivers * data.settings.centsPerKilometer;

    const oldPeople = data.resulting.people;
    const people = [];
    for (let i = 0; i < data.settings.crewSize; i++) {
        const kilometer = oldPeople[i] ? oldPeople[i].kilometer : 0;
        people.push({
            id: i,
            name: oldPeople[i] ? oldPeople[i].name : "",
            departurePoint: oldPeople[i] ? oldPeople[i].departurePoint : "",
            kilometer,
            motorVehicleCompensation: totalDrivenKilometers ? (kilometer / totalDrivenKilometers) * 100 * totalCostInCentsKFZ / 10000 : 0,
            compensation: i == 0 /*If Referee*/ ? data.evaluated.compensations.jugendspiel + data.evaluated.compensations.referee : data.evaluated.compensations.jugendspiel + data.evaluated.compensations.other,
        })
    }
    return people;
}

function buildCalculationInterface(data) {
    const table = `
        <table class="editable-table" id="calculations-table">
        <tr>
            <th>Position</th>
            <th>Kilometer</th>
            <th>KFZ-Erstattung</th>
            <th>Pauschal</th>
        </tr>
        ${data.resulting.people.map((person, index) => `
            <tr>
                <td>${crewDesignations[data.settings.crewSize][index]}</td>
                <td><input type="number" id="kilometer-${index}" value="${person.kilometer}"></input></td>
                <td>${person.motorVehicleCompensation.toFixed(2)} €</td>
                <td>${person.compensation} €</td>
            </tr>
        `).join('')}
        </table>
    `;
    return table;
}

function fillSummary(data) {
    const summaryData = generateSummary(data);
    document.getElementById("other-count").textContent = summaryData.other.count;
    document.getElementById("total-count").textContent = summaryData.other.count + summaryData.referee.count;
    document.getElementById("motor-vehicle-costs-0").textContent = summaryData.motorVehicleCompensations[0] ? `${summaryData.motorVehicleCompensations[0].toFixed(2)} €` : "0.00€";
    document.getElementById("motor-vehicle-costs-1").textContent = summaryData.motorVehicleCompensations[1] ? `${summaryData.motorVehicleCompensations[1].toFixed(2)} €` : "0.00€";
    document.getElementById("motor-vehicle-costs-2").textContent = summaryData.motorVehicleCompensations[2] ? `${summaryData.motorVehicleCompensations[2].toFixed(2)} €` : "-";
    document.getElementById("referee-compensation").textContent = `${summaryData.referee.compensation.toFixed(2)} €`;
    document.getElementById("other-compensation").textContent = `${summaryData.other.compensation.toFixed(2)} €`;
    document.getElementById("jugendspiel-compensation").textContent = summaryData.jugendspiel.compensation ? `${summaryData.jugendspiel.compensation.toFixed(2)} €` : "-";
    document.getElementById("total-sum").textContent = summaryData.totalCosts.toFixed(2);
}

function fillPage(data, calculationInterfaceContainer) {
    calculationInterfaceContainer.innerHTML = buildCalculationInterface(data);
    fillSummary(data);
}

function activateInputs(data, calculationInterfaceContainer) {
    for (let i = 0; i < data.settings.crewSize; i++) {
        {
            const kilometerInputI = document.getElementById(`kilometer-${i}`);
            const kilometerListenerI = function() {
                data.resulting.people[i].kilometer = parseInt(kilometerInputI.value);
                onAffectedDataUpdate(data, calculationInterfaceContainer);
            }
            kilometerInputI.removeEventListener("change", kilometerListenerI);
            kilometerInputI.addEventListener("change", kilometerListenerI);
        }
    }
}

function onAffectedDataUpdate(data, calculationInterfaceContainer) {
    evaluateCompensations(data);
    data.resulting.people = calculateResultingValues(data);
    fillPage(data, calculationInterfaceContainer);
    activateInputs(data, calculationInterfaceContainer);
}

/*
 * Function which is called on window load.
*/
function main() {
    const crewSizeSelector = document.getElementById("crew");
    const scenarioSelector = document.getElementById("scenario");
    const isJugendSpielCheckbox = document.getElementById("jugendspiel");
    const centsPerKilometerInput = document.getElementById("cents-per-kilometer");
    const calculationInterfaceContainer = document.getElementById("calculation-interface");

    const params = new URLSearchParams(window.location.search);
    const vsData = params.get("d");

    const data = vsData ? getDataFromVersionSpecificData(JSON.parse(vsData)) : {
        settings: {
            crewSize: crewSizeSelector.value,
            scenario: scenarioSelector.value,
            isJugendSpiel: isJugendSpielCheckbox.checked,
            centsPerKilometer: centsPerKilometerInput.value
        },
        evaluated: {
            compensations: {
                referee: 0,
                other: 0,
                jugendspiel: 0
            },
        },
        resulting: {
            people: [],
        },
        game: {
            league: "",
            teams: {
                home: "",
                guest: ""
            },
            stadium: "",
            datetime: new Date()
        }
    };
    onAffectedDataUpdate(data, calculationInterfaceContainer);

    crewSizeSelector.addEventListener("change", function() {
        data.settings.crewSize = crewSizeSelector.value;
        onAffectedDataUpdate(data, calculationInterfaceContainer);
    });

    scenarioSelector.addEventListener("change", function() {
        data.settings.scenario = scenarioSelector.value;
        onAffectedDataUpdate(data, calculationInterfaceContainer);
    });

    isJugendSpielCheckbox.addEventListener("change", function() {
        data.settings.isJugendSpiel = isJugendSpielCheckbox.checked;
        onAffectedDataUpdate(data, calculationInterfaceContainer);
    });

    centsPerKilometerInput.addEventListener("change", function() {
        data.settings.centsPerKilometer = centsPerKilometerInput.value;
        onAffectedDataUpdate(data, calculationInterfaceContainer);
    });

    // Add Copy-To-Clipboard:
    document.getElementById("copy-to-clipboard").addEventListener("click", function() {
        const vsData = createVersionSpecificDataFromData(dataVersion, data);
        const url = createDataFilledUrl("", vsData, domain, repositoryName);
        copyTextToClipboard(url);
    });

    // Add Create-Schiedrichterquitting:
    document.getElementById("create-schiedrichterquittung").addEventListener("click", function() {
        const vsData = createVersionSpecificDataFromData(dataVersion, data);
        const url = createDataFilledUrl("create.html", vsData, domain, repositoryName);
        location.href = url;
    });
}

window.addEventListener("load", main);
