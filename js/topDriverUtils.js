function getTopDrivers(crewSize, people) {
    const carCount = (crewSize <= 5) ? 2 : 3;
    return [...people].sort((a, b) => b.kilometer - a.kilometer).slice(0, carCount);
}

function getTotalKilometersTopDrivers(topDrivers) {
    return topDrivers.reduce((sum, fahrer) => sum + fahrer.kilometer, 0);
}
