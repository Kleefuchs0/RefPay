function createVersionSpecificExportData(dataVersion, amounts, topDriver, eurosPerKilometer, totalAmounts, scenario, isJugendspiel, refereeCompensation, otherCompensation, jugendspielCompensation) {
    const vsedata = {
        ver: dataVersion,
        b64d: btoa(JSON.stringify({
            a: amounts,
            t: topDriver,
            ta: totalAmounts,
            epk: eurosPerKilometer,
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
        case "v2.7":
            {
                const ed = JSON.parse(atob(versionSpecificExportData.b64d));
                return {
                    version: versionSpecificExportData.ver,
                    topDriver: ed.t,
                    eurosPerKilometer: ed.epk,
                    totalAmounts: ed.ta,
                    amounts: (function() {
                        let tempAmounts = ed.a.map(amount => ({
                            person: amount.person,
                            betrag: amount.betrag,
                            kilometer: amount.kilometer,
                            lname: amount.lname ? amount.lname : "",
                            departurePoint: amount.departurePoint ? amount.departurePoint : ""
                        }));
                        return tempAmounts;
                    })(),
                    scenario: ed.s,
                    isJugendspiel: ed.ijs,
                    refereeCompensation: ed.rC,
                    otherCompensation: ed.oC,
                    jugendspielCompensation: ed.jC,
                }
            }
        case "v2.6.1":
            {
                const ed = JSON.parse(atob(versionSpecificExportData.b64d));
                return {
                    version: versionSpecificExportData.ver,
                    amounts: (function() {
                        let tempAmounts = ed.a.map(amount => ({
                            person: amount.person,
                            betrag: amount.betrag,
                            kilometer: amount.kilometer,
                            lname: amount.lname ? amount.lname : "",
                            departurePoint: amount.departurePoint ? amount.departurePoint : ""
                        }));
                        return tempAmounts;
                    })(),
                    scenario: ed.s,
                    isJugendspiel: ed.ijs,
                    refereeCompensation: ed.rC,
                    otherCompensation: ed.oC,
                    jugendspielCompensation: ed.jC,
                }
            }
    }
}

function createVersionSpecificExportDataFromExportData(edata) {
    return createVersionSpecificExportData(edata.version, edata.amounts, edata.scenario, edata.isJugendspiel, edata.refereeCompensation, edata.otherCompensation, edata.jugendspielCompensation);
}
