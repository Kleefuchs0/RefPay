function getExportDataFromVersionSpecificExportData(versionSpecificExportData) {
    switch (versionSpecificExportData.ver) {
        case "v2.6.1":
            const ed = JSON.parse(atob(versionSpecificExportData.b64d));
            return {
                version: versionSpecificExportData.ver,
                amount: ed.a,
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

console.log(edata);
