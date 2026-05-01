// Bezeichnungen für die Personen basierend auf Crew-Größe
function getPersonenBezeichnungen(anzahlPersonen) {
  switch(anzahlPersonen) {
    case 3:
      return {
        1: "Referee",
        2: "Linesman", 
        3: "Backjudge"
      };
    case 4:
      return {
        1: "Referee",
        2: "Linesman",
        3: "Linejudge",
        4: "Backjudge"
      };
    case 5:
      return {
        1: "Referee",
        2: "Umpire",
        3: "Linesman",
        4: "Linejudge",
        5: "Backjudge"
      };
    case 7:
      return {
        1: "Referee",
        2: "Umpire",
        3: "Linesman",
        4: "Linejudge",
        5: "Backjudge",
        6: "Sidejudge",
        7: "Fieldjudge"
      };
    case 8:
      return {
        1: "Referee",
        2: "Umpire",
        3: "Linesman",
        4: "Linejudge",
        5: "Backjudge",
        6: "Sidejudge",
        7: "Fieldjudge",
        8: "Centerjudge"
      };
    default:
      return {
        1: "Referee",
        2: "Umpire",
        3: "Linesman",
        4: "Linejudge",
        5: "Backjudge",
        6: "Sidejudge",
        7: "Fieldjudge",
        8: "Centerjudge"
      };
  }
}

// Kilometer-Eingabefelder erstellen
function createKilometerFields(anzahlPersonen) {
  const kilometerFelder = document.getElementById('kilometer-felder');
  kilometerFelder.innerHTML = '';

  const bezeichnungen = getPersonenBezeichnungen(anzahlPersonen);

  for (let i = 1; i <= anzahlPersonen; i++) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = `${bezeichnungen[i]}:`;
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Kilometer';
    input.id = `person-${i}`;
    input.value = '';

    container.appendChild(label);
    container.appendChild(input);
    kilometerFelder.appendChild(container);
  }
}

// Initiale Felder erstellen
window.addEventListener('load', function() {
  createKilometerFields(5); // Standard bleibt 5er Crew
});

// Crew-Größe ändern
document.getElementById('crew').addEventListener('change', function() {
  createKilometerFields(parseInt(this.value));
});

// Reset-Button
document.getElementById('reset').addEventListener('click', function() {
  const inputs = document.querySelectorAll('#kilometer-felder input');
  inputs.forEach(input => (input.value = ''));
  document.getElementById('szenario').value = 'einzelspiel';
  document.getElementById('jugendspiel').checked = false;
});

// Berechnung der Ergebnisse
document.getElementById('berechnen').addEventListener('click', function() {
  const anzahlPersonen = parseInt(document.getElementById('crew').value);
  const kilometerWerte = [];
  const szenario = document.getElementById('szenario').value;
  const isJugendspiel = document.getElementById('jugendspiel').checked;

  // Kilometerwerte sammeln
  for (let i = 1; i <= anzahlPersonen; i++) {
    const kilometer = parseFloat(document.getElementById(`person-${i}`).value) || 0;
    kilometerWerte.push({ person: i, kilometer });
  }

  // KFZ-Kosten berechnen - 2 Autos für 3er, 4er und 5er Crew, 3 Autos für 7er und 8er Crew
  const anzahlAutos = (anzahlPersonen <= 5) ? 2 : 3;
  const topFahrer = [...kilometerWerte].sort((a, b) => b.kilometer - a.kilometer).slice(0, anzahlAutos);
  const gesamtKilometer = topFahrer.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
  // Apply correction factor
  const gesamtkostenKFZ = ((gesamtKilometer * 100) * (0.35) * 100);
  gesamtkostenKFZ /= 10000;
  const gesamteGefahreneKilometer = kilometerWerte.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);

  // Anzahl der Personen mit Kilometer > 0
  const aktivePersonen = kilometerWerte.filter(fahrer => fahrer.kilometer > 0).length;

  let betraege;
  
  // Wenn Anzahl aktiver Personen <= Anzahl Autos, keine Rundung
  if (aktivePersonen <= anzahlAutos) {
    betraege = kilometerWerte.map(fahrer => ({
      person: fahrer.person,
      kilometer: fahrer.kilometer,
      betrag: fahrer.kilometer > 0 ? (fahrer.kilometer * 0.35) : 0
    }));
  } else {
    // Normale Berechnung mit Rundung
    betraege = kilometerWerte.map(fahrer => ({
      person: fahrer.person,
      kilometer: fahrer.kilometer,
      betrag: Math.floor((fahrer.kilometer / gesamteGefahreneKilometer) * gesamtkostenKFZ)
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

  switch(szenario) {
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
  document.getElementById('startseite').style.display = 'none';
  document.getElementById('ergebnisseite').style.display = 'block';

  // Bezeichnungen für die Tabelle holen
  const bezeichnungen = getPersonenBezeichnungen(anzahlPersonen);

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
  document.getElementById('auto1-kosten').textContent = topFahrer[0] ? `${(topFahrer[0].kilometer * 0.35).toFixed(2)} €` : "0.00 €";
  document.getElementById('auto2-kosten').textContent = topFahrer[1] ? `${(topFahrer[1].kilometer * 0.35).toFixed(2)} €` : "0.00 €";
  document.getElementById('auto3-kosten').textContent = topFahrer[2] ? `${(topFahrer[2].kilometer * 0.35).toFixed(2)} €` : "-";

  // Aufwandsentschädigungen in Tabelle eintragen
  document.getElementById('referee-entschaedigung').textContent = `${refereeEntschaedigung.toFixed(2)} €`;
  document.getElementById('andere-entschaedigung').textContent = `${andereEntschaedigung.toFixed(2)} €`;
  document.getElementById('jugendspiel-entschaedigung').textContent = isJugendspiel ? `${jugendspielEntschaedigung.toFixed(2)} €` : "-";

  // Gesamtbetrag anzeigen
  document.getElementById('gesamtbetrag').textContent = `${gesamtbetrag.toFixed(2)} €`;
});

// Zurück-Button
document.getElementById('zurueck').addEventListener('click', function() {
  document.getElementById('ergebnisseite').style.display = 'none';
  document.getElementById('startseite').style.display = 'block';
});

// Impressum-Links
document.getElementById('impressum-link').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('startseite').style.display = 'none';
  document.getElementById('ergebnisseite').style.display = 'none';
  document.getElementById('impressum-page').style.display = 'block';
});

document.getElementById('impressum-link-ergebnis').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('startseite').style.display = 'none';
  document.getElementById('ergebnisseite').style.display = 'none';
  document.getElementById('impressum-page').style.display = 'block';
});

// Zurück-Button Impressum
document.getElementById('zurueck-impressum').addEventListener('click', function() {
  document.getElementById('impressum-page').style.display = 'none';
  document.getElementById('startseite').style.display = 'block';
});
