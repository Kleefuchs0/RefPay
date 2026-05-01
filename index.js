const eurosPerKilometer = 0.35;

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

})

// Zurück-Button
document.getElementById('zurueck').addEventListener('click', function() {
  document.getElementById('ergebnisseite').style.display = 'none';
  document.getElementById('startseite').style.display = 'block';
});
