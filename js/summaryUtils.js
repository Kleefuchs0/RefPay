function generateSummary(data) {
    const topDrivers = getTopDrivers(data.settings.crewSize, data.resulting.people);
    const other = {
        compensation: data.evaluated.compensations.other * (data.settings.crewSize - 1),
        count: data.settings.crewSize - 1,
    };
    const referee = {
        compensation: data.evaluated.compensations.referee,
        count: 1,
    }
    const jugendspiel = {
        compensation: data.evaluated.compensations.jugendspiel * (data.settings.crewSize),
        count: data.settings.crewSize
    };
    const totalKilometersTopDrivers = getTotalKilometersTopDrivers(topDrivers);

    const totalCostInCentsKFZ = totalKilometersTopDrivers * data.settings.centsPerKilometer;
    const totalCosts = referee.compensation + other.compensation + jugendspiel.compensation + (totalCostInCentsKFZ / 100);
    const summaryData = {
        topDrivers,
        totalKilometersTopDrivers,
        totalCostKFZ: totalCostInCentsKFZ / 100,
        totalCosts,
        motorVehicleCompensations: topDrivers.map((driver) => driver.kilometer * data.settings.centsPerKilometer / 100),
        other,
        referee,
        jugendspiel 
    };

    return summaryData;
}

