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
    const carCount = (data.settings.crewSize <= 5) ? 2 : 3;
    const totalDrivenKilometers = data.resulting.people.reduce((sum, person) => sum + person.kilometer, 0);
    const topDrivers = [...data.resulting.people].sort((a, b) => b.kilometer - a.kilometer).slice(0, carCount);
    const totalKilometersTopDrivers = topDrivers.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
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
            carCompensation: totalDrivenKilometers ? (kilometer / totalDrivenKilometers) * 100 * totalCostInCentsKFZ / 10000 : 0,
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
                <td>${person.carCompensation.toFixed(2)} €</td>
                <td>${person.compensation} €</td>
            </tr>
        `).join('')}
        </table>
    `;
    return table;
}

function fillPage(data, calculationInterfaceContainer) {
    calculationInterfaceContainer.innerHTML = buildCalculationInterface(data);
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
    console.log(btoa(JSON.stringify(data)));
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

    const data = {
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
            motorVehicles: [],
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
}

window.addEventListener("load", main);
