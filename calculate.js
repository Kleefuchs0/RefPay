// Berechnung der Ergebnisse
const params = new URLSearchParams(window.location.search);
const data = JSON.parse(params.get("data"));

const anzahlPersonen = data.peopleAndKilometers.length;
const kilometerWerte = data.peopleAndKilometers;
const eurosPerKilometer = data.eurosPerKilometer;
const szenario = data.scenario;
const isJugendspiel = data.isJugendspiel;

console.log(data);
// KFZ-Kosten berechnen - 2 Autos für 3er, 4er und 5er Crew, 3 Autos für 7er und 8er Crew
const anzahlAutos = (anzahlPersonen <= 5) ? 2 : 3;
const topFahrer = [...kilometerWerte].sort((a, b) => b.kilometer - a.kilometer).slice(0, anzahlAutos);
const gesamtKilometerTopFahrer = topFahrer.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
// Apply correction factor. So calculation happens between ints and not floating point numbers.
const gesamtkostenKFZ = ((gesamtKilometerTopFahrer) * (eurosPerKilometer) * 100) / 100;
const gesamteGefahreneKilometer = kilometerWerte.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);

// Anzahl der Personen mit Kilometer > 0
const aktivePersonen = kilometerWerte.filter(fahrer => fahrer.kilometer > 0).length;

let betraege;

// Wenn Anzahl aktiver Personen <= Anzahl Autos, keine Rundung
if (aktivePersonen <= anzahlAutos) {
    betraege = kilometerWerte.map(fahrer => ({
        person: fahrer.person,
        kilometer: fahrer.kilometer,
        betrag: fahrer.kilometer > 0 ? (fahrer.kilometer * (eurosPerKilometer * 100)) / 100 : 0
    }));
} else {
    // Normale Berechnung mit Rundung
    betraege = kilometerWerte.map(fahrer => ({
        person: fahrer.person,
        kilometer: fahrer.kilometer,
        // Also apply correction factor
        betrag: Math.floor((fahrer.kilometer / gesamteGefahreneKilometer) * 100 * gesamtkostenKFZ * 100) / 10000
    }));

    const summeAbgerundet = betraege.reduce((sum, fahrer) => sum + fahrer.betrag, 0);
    const restbetrag = gesamtkostenKFZ - summeAbgerundet;
    const restProPerson = Math.floor(restbetrag / anzahlAutos);

    topFahrer.forEach(fahrer => {
        betraege[fahrer.person - 1].betrag += restProPerson;
    });

    const verbleibenderRest = gesamtkostenKFZ - betraege.reduce((sum, fahrer) => sum + fahrer.betrag, 0);
    if (verbleibenderRest > 0) {
        betraege[topFahrer[0].person - 1].betrag += verbleibenderRest;
    }
}

// Aufwandsentschädigungen berechnen
let refereeEntschaedigung = 0;
let andereEntschaedigung = 0;
let jugendspielEntschaedigung = isJugendspiel ? 25 * anzahlPersonen : 0;

switch (szenario) {
    case 'einzelspiel':
        refereeEntschaedigung = 70;
        andereEntschaedigung = 60 * (anzahlPersonen - 1);
        break;
    case 'turnier6':
        refereeEntschaedigung = 70;
        andereEntschaedigung = 70 * (anzahlPersonen - 1);
        break;
    case 'turnier6plus':
        refereeEntschaedigung = 90;
        andereEntschaedigung = 90 * (anzahlPersonen - 1);
        break;
}

// Gesamtbetrag berechnen
const gesamtbetrag = refereeEntschaedigung + andereEntschaedigung + jugendspielEntschaedigung + gesamtkostenKFZ;

// Ergebnisse anzeigen
document.getElementById('ergebnisseite').style.display = 'block';

// Bezeichnungen für die Tabelle holen
const bezeichnungen = getCrewDesignations(anzahlPersonen);

// Tabelle mit Personen und KFZ-Erstattungen erstellen
const tabelle = `
    <table>
      <tr>
        <th>Person</th>
        <th>Kilometer</th>
        <th>KFZ-Erstattung</th>
      </tr>
      ${kilometerWerte.map(fahrer => `
        <tr>
          <td>${bezeichnungen[fahrer.person]}</td>
          <td>${fahrer.kilometer} km</td>
          <td>${betraege.find(b => b.person === fahrer.person).betrag.toFixed(2)} €</td>
        </tr>
      `).join('')}
    </table>
  `;
document.getElementById('ergebnis-tabelle').innerHTML = tabelle;

// Schiedsrichter Anzahl anzeigen
document.getElementById('andere-sr-anzahl').textContent = anzahlPersonen - 1;
document.getElementById('gesamt-sr-anzahl').textContent = anzahlPersonen;

// KFZ-Kosten in Tabelle eintragen
document.getElementById('auto1-kosten').textContent = topFahrer[0] ? `${(topFahrer[0].kilometer * eurosPerKilometer).toFixed(2)} €` : "0.00 €";
document.getElementById('auto2-kosten').textContent = topFahrer[1] ? `${(topFahrer[1].kilometer * eurosPerKilometer).toFixed(2)} €` : "0.00 €";
document.getElementById('auto3-kosten').textContent = topFahrer[2] ? `${(topFahrer[2].kilometer * eurosPerKilometer).toFixed(2)} €` : "-";

// Aufwandsentschädigungen in Tabelle eintragen
document.getElementById('referee-entschaedigung').textContent = `${refereeEntschaedigung.toFixed(2)} €`;
document.getElementById('andere-entschaedigung').textContent = `${andereEntschaedigung.toFixed(2)} €`;
document.getElementById('jugendspiel-entschaedigung').textContent = isJugendspiel ? `${jugendspielEntschaedigung.toFixed(2)} €` : "-";

// Gesamtbetrag anzeigen
document.getElementById('gesamtbetrag').textContent = `${gesamtbetrag.toFixed(2)} €`;

