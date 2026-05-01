// Bezeichnungen für die Personen basierend auf Crew-Größe
function getCrewDesignations(anzahlPersonen) {
    switch (anzahlPersonen) {
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

