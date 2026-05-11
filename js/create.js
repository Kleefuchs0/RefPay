function buildEditableTable(data) {
    const table = `
        <table class="editable-table" id="editable-table">
        <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Abfahrtsort</th>
            <th>Kilometer</th>
        </tr>
        ${data.resulting.people.map((person, index) => `
            <tr>
                <td>${crewDesignations[data.settings.crewSize][index]}</td>
                <td><input type="text" placeholder="Name" id="name-${index}" value="${person.name}"></input></td>
                <td><input type="text" placeholder="Abfahrtsort" id="departurePoint-${index}" value="${person.departurePoint}"></input></td>
                <td>${person.kilometer}</td>
            </tr>
        `).join('')}
        </table>
    `;
    return table;
}

function activateInputs(data, editableInterface) {
    for (let i = 0; i < data.settings.crewSize; i++) {
        {
            const nameInputI = document.getElementById(`name-${i}`);
            const nameListenerI = function() {
                data.resulting.people[i].name = nameInputI.value;
                onAffectedDataUpdate(data, editableInterface);
            }
            nameInputI.removeEventListener("change", nameListenerI);
            nameInputI.addEventListener("change", nameListenerI);
        }
        {
            const departurePointInputI = document.getElementById(`departurePoint-${i}`);
            const departurePointListenerI = function() {
                data.resulting.people[i].departurePoint = departurePointInputI.value;
                onAffectedDataUpdate(data, editableInterface);
            }
            departurePointInputI.removeEventListener("change", departurePointListenerI);
            departurePointInputI.addEventListener("change", departurePointListenerI);
        }
    }
}

function fillPage(data, editableInterfaceContainer) {
    editableInterfaceContainer.innerHTML = buildEditableTable(data);
}

function onAffectedDataUpdate(data, editableInterfaceContainer) {
    fillPage(data, editableInterfaceContainer);
    activateInputs(data, editableInterfaceContainer);
}

function createPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    let tableHeaders = ["Name", "Position", "Abfahrtsort", "Kilometer", "Fahrtkosten", "Pauschale", "Unterschrift"];
    let tableData = function() {
        const tempTableData = [];
        for (let i = 0; i < data.resulting.people.length; i++) {
            const person = data.resulting.people[i];
            tempTableData.push({
                Name: person.name ? person.name.toString(): "\t",
                Position: crewDesignations[data.settings.crewSize][person.id],
                Abfahrtsort: person.departurePoint ? person.departurePoint.toString() : "\t",
                Kilometer: person.kilometer.toString(),
                Fahrtkosten: `${person.motorVehicleCompensation.toFixed(2)} €`,
                Pauschale: `${person.compensation.toFixed(2)} €`,
                Unterschrift: "\t"
            });
        }
        return tempTableData;
    }();
    console.log(tableData);
    doc.table(10, 40, tableData, tableHeaders, { autoSize: true, printHeaders: true, fontSize: 8});

    tableHeaders = [ "Referee", `Schiedsrichter`, "KFZ-1", "KFZ-2", "KFZ-3", "Jugendspiel", "Gesamtbetrag"];

    const summaryData = generateSummary(data);
    tableData = [{
        Referee: summaryData.referee.compensation.toString(),
        Schiedsrichter: summaryData.other.compensation.toString(),
        "KFZ-1": summaryData.motorVehicleCompensations[0] ? `${summaryData.motorVehicleCompensations[0]} €` : "0.00€",
        "KFZ-2": summaryData.motorVehicleCompensations[1] ? `${summaryData.motorVehicleCompensations[1]} €` : "0.00€",
        "KFZ-3": summaryData.motorVehicleCompensations[2] ? `${summaryData.motorVehicleCompensations[2]} €` : "-",
        Jugendspiel: `${summaryData.jugendspiel.compensation} €`,
        Gesamtbetrag: `${summaryData.totalCosts} €`
    }];
    console.log(tableData);

    doc.table(10, 40 + data.settings.crewSize * 14, tableData, tableHeaders, { autoSize: true, printHeaders: true, fontSize: 8});

    return doc;
}

function main() {
    const params = new URLSearchParams(location.search);
    const vsdata = JSON.parse(params.get("d"));
    const data = getDataFromVersionSpecificData(vsdata);
    const editableInterfaceContainer = document.getElementById("editable-interface")
    console.log(data);

    onAffectedDataUpdate(data, editableInterfaceContainer);

    const leagueInput = document.getElementById("league");
    leagueInput.addEventListener("change", function() {
        data.game.league = league.value;
    });

    const teamHomeInput = document.getElementById("team-home");
    teamHomeInput.addEventListener("change", function() {
        data.game.teams.home = teamHomeInput.value;
    });

    const teamGuestInput = document.getElementById("team-guest");
    teamHomeInput.addEventListener("change", function() {
        data.game.teams.guest = teamGuestInput.value;
    });

    const stadiumInput = document.getElementById("stadium");
    stadiumInput.addEventListener("change", function() {
        data.game.stadium = stadiumInput.value;
    })

    const dateTimeInput = document.getElementById("datetime");
    dateTimeInput.addEventListener("change", function() {
        data.game.datetime = new Date(dateTimeInput.value);
    });

    document.getElementById("return").addEventListener("click", function() {
        const vsData = createVersionSpecificDataFromData(dataVersion, data);
        const url = createDataFilledUrl("", vsData, domain, repositoryName);
        location.href = url;
    });

    document.getElementById("export").addEventListener("click", function() {
        const pdf = createPDF(data);
        pdf.save("quittung.pdf");
    });
}

window.addEventListener("load", main);
