function convertToMbps(bytes, time) {
    const seconds = time / 1000
    const bits = bytes * 8;
    return bits / seconds / 1000000;
}

function convertToKbps(bytes, time) {
    const seconds = time / 1000;
    const bits = bytes * 8;
    return bits / seconds / 1000;
}

function convertToBps(bytes, time) {
    const seconds = time / 1000;
    const bits = bytes * 8;
    return bits / seconds;
}

module.exports = { convertToBps, convertToMbps, convertToKbps };
