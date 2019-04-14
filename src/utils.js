function extractParams(startText) {
    const objParams = {};
    const params = startText.split(' ').slice(1);
    params.forEach(param => {
        const arr = param.split('/');
        objParams[arr[0]] = arr.length == 2 ? arr[1] : true;
    })
    return objParams;
}

module.exports = {
    extractParams
}