function getDataFromVersionSpecificData(versionSpecificData) {
    switch (versionSpecificData.version) {
        case "v2.6.1":
            const d = JSON.parse(atob(versionSpecificData.b64d));
            return {
                version: versionSpecificData.version,
                peopleAndKilometerValues: (function() {
                    const tempKMValues = [];
                    d.pkv.forEach(function(valuePair) {
                        tempKMValues.push({ person: valuePair.p, kilometer: valuePair.k});
                    })
                    return tempKMValues;
                })(),
                eurosPerKilometer: d.epK,
                scenario: d.s,
                isJugendspiel: d.ijs
            }
        case "v2.6":
            return {
                version: versionSpecificData.version,
                peopleAndKilometerValues: (function() {
                    const tempKMValues = [];
                    versionSpecificData.pkv.forEach(function(valuePair) {
                        tempKMValues.push({ person: valuePair.p, kilometer: valuePair.k});
                    })
                    return tempKMValues;
                })(),
                eurosPerKilometer: versionSpecificData.epK,
                scenario: versionSpecificData.s,
                isJugendspiel: versionSpecificData.ijs
            }
        case "v2.5":
            return {
                version: versionSpecificData.version,
                peopleAndKilometerValues: versionSpecificData.pkv,
                eurosPerKilometer: versionSpecificData.epK,
                scenario: versionSpecificData.s,
                isJugendspiel: versionSpecificData.ijs
            }
        default:            // Invalid Version, Before Version was included, or v2.4, because that introduced version
            return {
                version: versionSpecificData.version ? versionSpecificData.version : "v0.0",
                peopleAndKilometerValues: versionSpecificData.peopleAndKilometerValues,
                eurosPerKilometer: versionSpecificData.eurosPerKilometer,
                scenario: versionSpecificData.scenario,
                isJugendspiel: versionSpecificData.isJugendspiel
            }
    }
}

// Berechnung der Ergebnisse
const params = new URLSearchParams(window.location.search);
const versionSpecificData = JSON.parse(params.get("data"));
const data = getDataFromVersionSpecificData(versionSpecificData);

const numberOfPeople = data.peopleAndKilometerValues.length;
const peopleAndKilometerValues = data.peopleAndKilometerValues;
const eurosPerKilometer = data.eurosPerKilometer;
const scenario = data.scenario;
const isJugendspiel = data.isJugendspiel;

// KFZ-Kosten berechnen - 2 Autos für 3er, 4er und 5er Crew, 3 Autos für 7er und 8er Crew
const carCount = (numberOfPeople <= 5) ? 2 : 3;
const topDriver = [...peopleAndKilometerValues].sort((a, b) => b.kilometer - a.kilometer).slice(0, carCount);
const totalKilometersTopDrivers = topDriver.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
// Apply correction factor. So calculation happens between ints and not floating point numbers.
const totalCostKFZ = ((totalKilometersTopDrivers) * (eurosPerKilometer) * 100) / 100;
const totalDrivenKilometers = peopleAndKilometerValues.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);

// Anzahl der Personen mit Kilometer > 0
const activePeople = peopleAndKilometerValues.filter(fahrer => fahrer.kilometer > 0).length;

let amounts;

// Wenn Anzahl aktiver Personen <= Anzahl Autos, keine Rundung
if (activePeople <= carCount) {
    amounts = peopleAndKilometerValues.map(fahrer => ({
        person: fahrer.person,
        fname: "",
        lname: "",
        departurePoint: "",
        kilometer: fahrer.kilometer,
        betrag: fahrer.kilometer > 0 ? (fahrer.kilometer * (eurosPerKilometer * 100)) / 100 : 0
    }));
} else {
    // Normale Berechnung mit Rundung
    amounts = peopleAndKilometerValues.map(fahrer => ({
        person: fahrer.person,
        fname: "",
        lname: "",
        departurePoint: "",
        kilometer: fahrer.kilometer,
        // Also apply correction factor
        betrag: Math.floor((fahrer.kilometer / totalDrivenKilometers) * 100 * totalCostKFZ * 100) / 10000
    }));

    const summeAbgerundet = amounts.reduce((sum, fahrer) => sum + fahrer.betrag, 0);
    const restbetrag = totalCostKFZ - summeAbgerundet;
    const restProPerson = Math.floor(restbetrag / carCount);

    topDriver.forEach(fahrer => {
        amounts[fahrer.person - 1].betrag += restProPerson;
    });

    const verbleibenderRest = totalCostKFZ - amounts.reduce((sum, fahrer) => sum + fahrer.betrag, 0);
    if (verbleibenderRest > 0) {
        amounts[topDriver[0].person - 1].betrag += verbleibenderRest;
    }
}

// Aufwandsentschädigungen berechnen
let refereeCompensation = 0;
let otherCompensation = 0;
let jugendspielCompensation = isJugendspiel ? 25 : 0;

switch (scenario) {
    case 'einzelspiel':
        refereeCompensation = 70;
        otherCompensation = 60;
        break;
    case 'turnier6':
        refereeCompensation = 70;
        otherCompensation = 70;
        break;
    case 'turnier6plus':
        refereeCompensation = 90;
        otherCompensation = 90;
        break;
}

// Gesamtbetrag berechnen
const totalAmounts = refereeCompensation + otherCompensation * (numberOfPeople - 1) + jugendspielCompensation * numberOfPeople + totalCostKFZ;

// Ergebnisse anzeigen
document.getElementById('ergebnisseite').style.display = 'block';

// Bezeichnungen für die Tabelle holen
const designations = getCrewDesignations(numberOfPeople);

// Tabelle mit Personen und KFZ-Erstattungen erstellen
const tabelle = `
    <table>
      <tr>
        <th>Person</th>
        <th>Kilometer</th>
        <th>KFZ-Erstattung</th>
      </tr>
      ${peopleAndKilometerValues.map(fahrer => `
        <tr>
          <td>${designations[fahrer.person]}</td>
          <td>${fahrer.kilometer} km</td>
          <td>${amounts.find(b => b.person === fahrer.person).betrag.toFixed(2)} €</td>
        </tr>
      `).join('')}
    </table>
  `;

document.getElementById('ergebnis-tabelle').innerHTML = tabelle;

// Schiedsrichter Anzahl anzeigen
document.getElementById('andere-sr-anzahl').textContent = numberOfPeople - 1;
document.getElementById('gesamt-sr-anzahl').textContent = numberOfPeople;

// KFZ-Kosten in Tabelle eintragen
document.getElementById('auto1-kosten').textContent = topDriver[0] ? `${(topDriver[0].kilometer * (eurosPerKilometer * 100) / 100).toFixed(2)} €` : "0.00 €";
document.getElementById('auto2-kosten').textContent = topDriver[1] ? `${(topDriver[1].kilometer * (eurosPerKilometer * 100) / 100).toFixed(2)} €` : "0.00 €";
document.getElementById('auto3-kosten').textContent = topDriver[2] ? `${(topDriver[2].kilometer * (eurosPerKilometer * 100) / 100).toFixed(2)} €` : "-";

// Aufwandsentschädigungen in Tabelle eintragen
document.getElementById('referee-entschaedigung').textContent = `${refereeCompensation.toFixed(2)} €`;
document.getElementById('andere-entschaedigung').textContent = `${(otherCompensation * (numberOfPeople - 1)).toFixed(2)} €`;
document.getElementById('jugendspiel-entschaedigung').textContent = isJugendspiel ? `${(jugendspielCompensation * (numberOfPeople -1)).toFixed(2)} €` : "-";

// Gesamtbetrag anzeigen
document.getElementById('gesamtbetrag').textContent = `${totalAmounts.toFixed(2)} €`;


document.getElementById('copy-clipboard').addEventListener('click', function() {
    copyTextToClipboard(location.href);
});

// Collect data for exporting
document.getElementById('export').addEventListener('click', function() {
    const edata = createVersionSpecificExportData(dataVersion, amounts, scenario, isJugendspiel, refereeCompensation, otherCompensation, jugendspielCompensation)
    var params = new URLSearchParams();
    params.append("edata", JSON.stringify(edata));
    const url = "export.html?" + params.toString();
    location.href = url;
})
