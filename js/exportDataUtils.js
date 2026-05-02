function createVersionSpecificExportData(dataVersion, amounts, scenario, isJugendspiel, refereeCompensation, otherCompensation, jugendspielCompensation) {
    const vsedata = {
        ver: dataVersion,
        b64d: btoa(JSON.stringify({
            a: amounts,
            s: scenario,
            ijs: isJugendspiel,
            rC: refereeCompensation,
            oC: otherCompensation,
            jC: jugendspielCompensation,
        }))
    }
    console.log(vsedata);
    return vsedata;
}

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

function createVersionSpecificExportDataFromExportData(edata) {
    return createVersionSpecificExportData(edata.version, edata.amounts, edata.scenario, edata.isJugendspiel, edata.refereeCompensation, edata.otherCompensation, edata.jugendspielCompensation);
}
