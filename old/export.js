
const params = new URLSearchParams(window.location.search);
const versionSpecificExportData = JSON.parse(params.get("edata"));
let edata = getExportDataFromVersionSpecificExportData(versionSpecificExportData);
console.log(edata);

const numberOfPeople = edata.amounts.length;
const designations = getCrewDesignations(numberOfPeople);

function updateTable() {
    const table = `
    <table>
      <tr>
        <th>Name</th>
        <th>Abfahrtsort</th>
        <th>Position</th>
        <th>Kilometer</th>
        <th>KFZ-Erstattung</th>
        <th>Pauschale</th>
      </tr>
      ${edata.amounts.map(fahrer => `
        <tr>
          <td><input type="text" id="lname-${fahrer.person}" name="lname" value="${fahrer.lname}"></td>
          <td><input type="text" id="departurePoint-${fahrer.person}" name="departurePoint" value="${fahrer.departurePoint}"></td>
          <td>${designations[fahrer.person]}</td>
          <td>${fahrer.kilometer} km</td>
          <td>${fahrer.betrag.toFixed(2)} €</td>
          <td>${(fahrer.person == 1) ? edata.jugendspielCompensation + edata.refereeCompensation : edata.jugendspielCompensation + edata.otherCompensation} €</td>
        </tr>
      `).join('')}
    </table>
  `;
    document.getElementById('ergebnis-tabelle').innerHTML = table;
}

// Create table
window.addEventListener('load', function() {
    updateTable();
    for (let i = 0; i < numberOfPeople; i++) {
        document.getElementById(`lname-${i + 1}`).addEventListener("change", function() {
            edata.amounts[i].lname = document.getElementById(`lname-${i + 1}`).value;
        })
        document.getElementById(`departurePoint-${i + 1}`).addEventListener("change", function() {
            edata.amounts[i].departurePoint = document.getElementById(`departurePoint-${i + 1}`).value;
        })
    }

    // Schiedsrichter Anzahl anzeigen
    document.getElementById('andere-sr-anzahl').textContent = numberOfPeople - 1;
    document.getElementById('gesamt-sr-anzahl').textContent = numberOfPeople;

    // KFZ-Kosten in Tabelle eintragen
    document.getElementById('auto1-kosten').textContent = edata.topDriver[0] ? `${(edata.topDriver[0].kilometer * (edata.eurosPerKilometer * 100) / 100).toFixed(2)} €` : "0.00 €";
    document.getElementById('auto2-kosten').textContent = edata.topDriver[1] ? `${(edata.topDriver[1].kilometer * (edata.eurosPerKilometer * 100) / 100).toFixed(2)} €` : "0.00 €";
    document.getElementById('auto3-kosten').textContent = edata.topDriver[2] ? `${(edata.topDriver[2].kilometer * (edata.eurosPerKilometer * 100) / 100).toFixed(2)} €` : "-";

    // Aufwandsentschädigungen in Tabelle eintragen
    document.getElementById('referee-entschaedigung').textContent = `${edata.refereeCompensation.toFixed(2)} €`;
    document.getElementById('andere-entschaedigung').textContent = `${(edata.otherCompensation * (numberOfPeople - 1)).toFixed(2)} €`;
    document.getElementById('jugendspiel-entschaedigung').textContent = edata.isJugendspiel ? `${(edata.jugendspielCompensation * numberOfPeople).toFixed(2)} €` : "-";

    // Gesamtbetrag anzeigen
    document.getElementById('gesamtbetrag').textContent = `${edata.totalAmounts.toFixed(2)} €`;
});

document.getElementById('round-kfz').addEventListener("click", function() {
    for (let i = 0; i < numberOfPeople; i++) {
        edata.amounts[i].betrag = Math.round(edata.amounts[i].betrag);
    }
    updateTable();
});

document.getElementById('copy-clipboard').addEventListener('click', function() {
    const versionSpecificExportData = createVersionSpecificExportDataFromExportData(edata)
    var params = new URLSearchParams();
    params.append("edata", JSON.stringify(versionSpecificExportData));
    const origin = window.location.origin.replace(domain, domain + "/" + repositoryName);           // Only replaces it when hosted on github pages. So I can still localy debug
    const url = origin + "/export.html?" + params.toString();
    copyTextToClipboard(url);
});
