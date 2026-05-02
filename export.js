
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
        <th>Nachname</th>
        <th>Abfahrtsort</th>
        <th>Position</th>
        <th>Kilometer</th>
        <th>KFZ-Erstattung</th>
        <th>Pauschale</th>
      </tr>
      ${edata.amounts.map(fahrer => `
        <tr>
          <td><input type="text" id="fname-${fahrer.person}" name="fname" value="${fahrer.fname}"></td>
          <td><input type="text" id="lname-${fahrer.person}" name="lname" value="${fahrer.lname}"></td>
          <td><input type="text" id="departurePoint-${fahrer.person}" name="departurePoint" value="${fahrer.departurePoint}"></td>
          <td>${designations[fahrer.person]}</td>
          <td>${fahrer.kilometer} km</td>
          <td>${fahrer.betrag.toFixed(2)} €</td>
          <td>${(fahrer.person==1) ? edata.jugendspielCompensation + edata.refereeCompensation : edata.jugendspielCompensation + edata.otherCompensation} €</td>
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
        document.getElementById(`fname-${i + 1}`).addEventListener("change", function() {
            edata.amounts[i].fname = document.getElementById(`fname-${i + 1}`).value;
        })
        document.getElementById(`lname-${i + 1}`).addEventListener("change", function() {
            edata.amounts[i].lname = document.getElementById(`lname-${i + 1}`).value;
        })
        document.getElementById(`departurePoint-${i + 1}`).addEventListener("change", function() {
            edata.amounts[i].departurePoint = document.getElementById(`departurePoint-${i + 1}`).value;
        })
    }
});

document.getElementById('copy-clipboard').addEventListener('click', function() {
    const versionSpecificExportData = createVersionSpecificExportDataFromExportData(edata)
    var params = new URLSearchParams();
    params.append("edata", JSON.stringify(versionSpecificExportData));
    const origin = window.location.origin.replace(domain, domain + "/" + repositoryName);
    const url = origin + "/export.html?" + params.toString();
    copyTextToClipboard(url);
});
