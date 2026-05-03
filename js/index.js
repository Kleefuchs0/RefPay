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

function getTopDrivers(crewSize, people) {
    const carCount = (crewSize <= 5) ? 2 : 3;
    return [...people].sort((a, b) => b.kilometer - a.kilometer).slice(0, carCount);
}

function getTotalKilometersTopDrivers(topDrivers) {
    return topDrivers.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
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
        <table id="calculations-table">
        <tr>
            <th>Name</th>
            <th>Abfahrtort</th>
            <th>Position</th>
            <th>Kilometer</th>
            <th>KFZ-Erstattung</th>
            <th>Pauschal</th>
        </tr>
        ${data.resulting.people.map((person, index) => `
            <tr>
                <td><input type="text" id="name-${index}" value="${person.name}"></input></td>
                <td><input type="text" id="departurePoint-${index}" value="${person.departurePoint}"></input></td>
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
    const numberOfPeople = data.settings.crewSize;
    const topDrivers = getTopDrivers(data.settings.crewSize, data.resulting.people);
    document.getElementById("other-count").textContent = numberOfPeople - 1;
    document.getElementById("total-count").textContent = numberOfPeople;
    document.getElementById("motor-vehicle-costs-0").textContent = topDrivers[0] ? `${(topDrivers[0].kilometer * data.settings.centsPerKilometer / 100).toFixed(2)} €` : "0.00€";
    document.getElementById("motor-vehicle-costs-1").textContent = topDrivers[1] ? `${(topDrivers[1].kilometer * data.settings.centsPerKilometer / 100).toFixed(2)} €` : "0.00€";
    document.getElementById("motor-vehicle-costs-2").textContent = topDrivers[2] ? `${(topDrivers[2].kilometer * data.settings.centsPerKilometer / 100).toFixed(2)} €` : "-";
    document.getElementById("referee-compensation").textContent = `${data.evaluated.compensations.referee.toFixed(2)} €`;
    document.getElementById("other-compensation").textContent = `${(data.evaluated.compensations.other * (numberOfPeople - 1)).toFixed(2)} €`;
    document.getElementById("jugendspiel-compensation").textContent = data.settings.isJugendSpiel ? `${(data.evaluated.compensations.jugendspiel * numberOfPeople).toFixed(2)} €` : "-"
    const totalKilometersTopDrivers = getTotalKilometersTopDrivers(topDrivers);
    const totalCostInCentsKFZ = totalKilometersTopDrivers * data.settings.centsPerKilometer;
    const totalAmounts = data.evaluated.compensations.referee + data.evaluated.compensations.other * (numberOfPeople - 1) + data.evaluated.compensations.jugendspiel * numberOfPeople + (totalCostInCentsKFZ / 100);
    document.getElementById("total-sum").textContent = totalAmounts.toFixed(2);
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
                onDataUpdate(data, calculationInterfaceContainer);
            }
            kilometerInputI.removeEventListener("change", kilometerListenerI);
            kilometerInputI.addEventListener("change", kilometerListenerI);
        }

        {
            const nameInputI = document.getElementById(`name-${i}`);
            const nameListenerI = function() {
                data.resulting.people[i].name = nameInputI.value;
                onDataUpdate(data, calculationInterfaceContainer);
            }
            nameInputI.removeEventListener("change", nameListenerI);
            nameInputI.addEventListener("change", nameListenerI);
        }
        {
            const departurePointI = document.getElementById(`departurePoint-${i}`);
            const departurePointListenerI = function() {
                data.resulting.people[i].departurePoint = departurePointI.value;
                onDataUpdate(data, calculationInterfaceContainer);
            }
            departurePointI.removeEventListener("change", departurePointListenerI);
            departurePointI.addEventListener("change", departurePointListenerI);
        }
    }
}

function onDataUpdate(data, calculationInterfaceContainer) {
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
        }
    };
    onDataUpdate(data, calculationInterfaceContainer);

    crewSizeSelector.addEventListener("change", function() {
        data.settings.crewSize = crewSizeSelector.value;
        onDataUpdate(data, calculationInterfaceContainer);
    });

    scenarioSelector.addEventListener("change", function() {
        data.settings.scenario = scenarioSelector.value;
        onDataUpdate(data, calculationInterfaceContainer);
    });

    isJugendSpielCheckbox.addEventListener("change", function() {
        data.settings.isJugendSpiel = isJugendSpielCheckbox.checked;
        onDataUpdate(data, calculationInterfaceContainer);
    });

    centsPerKilometerInput.addEventListener("change", function() {
        data.settings.centsPerKilometer = centsPerKilometerInput.value;
        onDataUpdate(data, calculationInterfaceContainer);
    });

    // Add Copy-To-Clipboard:
    document.getElementById("copy-to-clipboard").addEventListener("click", function() {
        const vsData = createVersionSpecificDataFromData(dataVersion, data);
        const params = new URLSearchParams();
        params.append("d", JSON.stringify(vsData));
        const origin = window.location.origin.replace(domain, domain + "/" + repositoryName);           // Only replaces it when hosted on github pages. So I can still localy debug
        const url = origin + "?" + params.toString();
        copyTextToClipboard(url);
    });
}

window.addEventListener("load", main);
