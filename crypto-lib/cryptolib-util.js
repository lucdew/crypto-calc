var random = require('./cryptolib-random');
function generateRandomNumberString(length) {
    var buffer = random.generate(length);
    var aNum = '';
    for (var i = 0; i < length; i++) {
        aNum += (buffer[i] % 10).toString();
    }
    return aNum;
}
function bitwiseBuffers(a, b, bitwiseOperation) {
    var res = [];
    if (a.length > b.length) {
        for (var i = 0; i < b.length; i++) {
            res.push(bitwiseOperation(a[i], b[i]));
        }
    }
    else {
        for (var i = 0; i < a.length; i++) {
            res.push(bitwiseOperation(a[i], b[i]));
        }
    }
    return new Buffer(res);
}
function rightPad(aString, length, padChar) {
    var result = aString;
    while (result.length < length) {
        result += padChar;
    }
    return result;
}
function leftPad(aString, n, padChar) {
    if (aString.length >= n) {
        return aString;
    }
    else {
        var paddedString = aString;
        while (paddedString.length !== n) {
            paddedString = padChar + paddedString;
        }
    }
}
function takeLast(aString, n) {
    if (aString.length > n) {
        return aString.substring(aString.length - n);
    }
    else {
        if (aString.length < n) {
            return leftPad(aString, n, '0');
        }
        else {
            return aString;
        }
    }
}
var util = {
    takeLast: takeLast,
    leftPad: leftPad,
    rightPad: rightPad,
    generateRandomNumberString: generateRandomNumberString,
    createBuffer: function (data, encoding) {
        return new Buffer(data, encoding);
    },
    toHex: function (data) {
        return data.toString('hex').toUpperCase();
    },
    fromHex: function (data) {
        return new Buffer(data, 'hex');
    },
    xor: function (a, b) {
        return bitwiseBuffers(a, b, function (aNum, bNum) { return aNum ^ bNum; });
    },
    and: function (a, b) {
        return bitwiseBuffers(a, b, function (aNum, bNum) { return aNum & bNum; });
    },
    or: function (a, b) {
        return bitwiseBuffers(a, b, function (aNum, bNum) { return aNum | bNum; });
    },
    not: function (a) {
        var res = [];
        for (var i = 0; i < a.length; i++) {
            res.push(~a[i]);
        }
        return new Buffer(res);
    }
};
module.exports = util;
//# sourceMappingURL=cryptolib-util.js.map