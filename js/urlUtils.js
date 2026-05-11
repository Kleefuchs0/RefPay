

function createDataFilledUrl(internalTarget, vsData, domain, repositoryName) {
    const params = new URLSearchParams();
    params.append("d", JSON.stringify(vsData));
    const origin = window.location.origin.replace(domain, domain + "/" + repositoryName);           // Only replaces it when hosted on github pages. So I can still localy debug
    const url = origin  + `/${internalTarget}?` + params.toString();
    return url
}
