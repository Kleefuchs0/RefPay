
function createVersionSpecificDataFromData(dataVersion, data) {
    return {
        v: dataVersion,
        b64d: btoa(JSON.stringify({
            s: {
                c: data.settings.crewSize,
                s: data.settings.scenario,
                iJ: data.settings.isJugendSpiel,
                cpk: data.settings.centsPerKilometer,
            },
            r: {
                p: data.resulting.people.map((person) => {
                    return {
                        i: person.id,
                        n: person.name,
                        d: person.departurePoint,
                        k: person.kilometer,
                        m: person.motorVehicleCompensation,
                        c: person.compensation
                    };
                })
            },
            g: {
                l: data.game.league,
                t: {
                    h: data.game.teams.home,
                    g: data.game.teams.guest
                },
                s: data.game.stadium,
                d: data.game.datetime
            }
        }))
    }
}

function getDataFromVersionSpecificData(vsData) {
    const ed = JSON.parse(atob(vsData.b64d));
    switch (vsData.v) {
        case "v3.0":
            return {
                settings: {
                    crewSize: ed.s.c,
                    scenario: ed.s.s,
                    isJugendSpiel: ed.s.iJ,
                    centsPerKilometer: ed.s.cpk
                },
                evaluated: {
                    compensations: {
                        refeere: 0,
                        other: 0,
                        jugendSpiel: 0
                    }
                },
                resulting: {
                    people: ed.r.p.map((person) => {
                        return {
                            id: person.i,
                            name: person.n,
                            departurePoint: person.d,
                            kilometer: person.k,
                            motorVehicleCompensation: person.m,
                            compensation: person.c
                        }
                    })
                },
                game: {
                    league: ed.g.l,
                    teams: {
                        home: ed.g.t.h,
                        guest: ed.g.t.g
                    },
                    stadium: ed.g.s,
                    datetime: ed.g.d
                }
            }
    }
}
