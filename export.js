function getExportDataFromVersionSpecificExportData(versionSpecificExportData) {
    switch (versionSpecificExportData.ver) {
        case "v2.6.1":
            const ed = JSON.parse(atob(versionSpecificExportData.b64d));
            return {
                version: versionSpecificExportData.ver,
                amounts: ed.a,
                scenario: ed.s,
                isJugendspiel: ed.ijs,
                refereeCompensation: ed.rC,
                otherCompensation: ed.oC,
                jugendspielCompensation: ed.jC,
            }
    }
}

const params = new URLSearchParams(window.location.search);
const versionSpecificExportData = JSON.parse(params.get("edata"));
const edata = getExportDataFromVersionSpecificExportData(versionSpecificExportData);

amounts = edata.amounts;
const numberOfPeople = edata.amounts.length;
const designations = getCrewDesignations(numberOfPeople);

function updateTable() {
    const table = `
    <table>
      <tr>
        <th>Name</th>
        <th>Nachname</th>
        <th>Abfahrtsort</th>
        <th>Position</th>
        <th>Kilometer</th>
        <th>KFZ-Erstattung</th>
      </tr>
      ${amounts.map(fahrer => `
        <tr>
          <td><input type="text" id="fname-${fahrer.person}" name="fname" value="${fahrer.name}"></td>
          <td><input type="text" id="lname-${fahrer.person}" name="lname" value="${fahrer.lastName}"></td>
          <td><input type="text" id="departurePoint-${fahrer.person}" name="departurePoint" value="${fahrer.departurePoint}"></td>
          <td>${designations[fahrer.person]}</td>
          <td>${fahrer.kilometer} km</td>
          <td>${amounts.find(b => b.person === fahrer.person).betrag.toFixed(2)} €</td>
        </tr>
      `).join('')}
    </table>
  `;
    document.getElementById('ergebnis-tabelle').innerHTML = table;
}

updateTable();

for (let i = 0; i < numberOfPeople; i++) {
    document.getElementById(`fname-${i+1}`).addEventListener("change", function() {
        amounts[i].fname = document.getElementById(`fname-${i+1}`).value;
    })
    document.getElementById(`lname-${i+1}`).addEventListener("change", function() {
        amounts[i].lname = document.getElementById(`lname-${i+1}`).value;
    })
    document.getElementById(`departurePoint-${i+1}`).addEventListener("change", function() {
        amounts[i].lname = document.getElementById(`departurePoint-${i+1}`).value;
    })
}
