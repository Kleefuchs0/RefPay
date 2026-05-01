const eurosPerKilometer = 0.35;

// Kilometer-Eingabefelder erstellen
function createKilometerFields(anzahlPersonen) {
    const kilometerFelder = document.getElementById('kilometer-felder');
    kilometerFelder.innerHTML = '';

    const bezeichnungen = getCrewDesignations(anzahlPersonen);

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

// Collect data for calculation
document.getElementById('berechnen').addEventListener('click', function() {
    const data = {
        version: version,
        peopleAndKilometerValues: (function() {
            const tempKMValues = [];
            for (let i = 1; i <= document.getElementById('crew').value; i++) {
                const kilometer = parseFloat(document.getElementById(`person-${i}`).value) || 0;
                tempKMValues.push({ person: i, kilometer });
            }
            return tempKMValues;
        })(),
        scenario: document.getElementById('szenario').value,
        isJugendspiel: document.getElementById('jugendspiel').checked,
        eurosPerKilometer: eurosPerKilometer
    }
    var params = new URLSearchParams();
    params.append("data", JSON.stringify(data));
    const url = "calculate.html?" + params.toString();
    location.href = url;
})
