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
}

window.addEventListener("load", main);
