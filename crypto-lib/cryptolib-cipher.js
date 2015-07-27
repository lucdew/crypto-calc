var error = require('./cryptolib-error');
var util = require('./cryptolib-util');
var padding = require('./cryptolib-padding');
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
var forge;
if (nodejs) {
    forge = require('node-forge');
}
else {
    forge = window.forge;
}
var blockCipherMode = {
    ecb: { name: 'ECB', cryptoName: 'ecb', hasIV: false },
    cbc: { name: 'CBC', cryptoName: 'cbc', hasIV: true },
    cfb: { name: 'CFB', cryptoName: 'cfb', hasIV: true },
    ofb: { name: 'OFB', cryptoName: 'ofb', hasIV: true },
    getAll: function () {
        return [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb];
    }
};
var cipherAlgo = {
    aes: { blockSize: 16, name: 'AES', cryptoName: 'aes', keyLengths: [128, 192, 256] },
    des: { blockSize: 8, name: 'DES', cryptoName: 'des', keyLengths: [64] },
    desede: { blockSize: 8, name: '3DES', cryptoName: 'des-ede', keyLengths: [64, 128, 192] },
    getAll: function () {
        return [cipherAlgo.aes, cipherAlgo.des, cipherAlgo.desede];
    }
};
function genNullIv(length) {
    var iv = new Buffer(length);
    iv.fill(0);
    return iv;
}
function getNodeJsSymCryptoAlgorithm(key, aCipherAlgo, aBlockCipherMode) {
    var algo = aCipherAlgo.cryptoName;
    if (aCipherAlgo === cipherAlgo.desede && key.length === 192) {
        algo += '3';
    }
    else if (aCipherAlgo === cipherAlgo.aes) {
        algo += '-' + key.length * 8;
    }
    if (aBlockCipherMode === blockCipherMode.ecb && aCipherAlgo !== cipherAlgo.aes) {
        return algo;
    }
    algo += '-';
    algo += aBlockCipherMode.cryptoName;
    return algo;
}
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function toForgeBuffer(buffer) {
    return forge.util.createBuffer(toArrayBuffer(buffer));
}
function getForgeCryptoAlgo(aCipherAlgo, aBlockCipherMode) {
    var forgeCryptoAlgo = null;
    if (aCipherAlgo == cipherAlgo.aes) {
        forgeCryptoAlgo = "AES-";
    }
    else if (aCipherAlgo == cipherAlgo.des || aCipherAlgo == cipherAlgo.desede) {
        forgeCryptoAlgo = "DES-";
    }
    else {
        error.raiseInvalidArg("Unexpected cipher algo " + cipherAlgo);
    }
    forgeCryptoAlgo += aBlockCipherMode.name;
    return forgeCryptoAlgo;
}
function doForgeCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, iv) {
    var cipher;
    var forgeCryptoAlgo = getForgeCryptoAlgo(aCipherAlgo, aBlockCipherMode);
    var keyBuffer = toForgeBuffer(key);
    if (aCipherAlgo == cipherAlgo.desede && key.length == 16) {
        var mykey = new Buffer(24);
        key.copy(mykey, 0, 0, 16);
        key.copy(mykey, 16, 0, 8);
        keyBuffer = toForgeBuffer(mykey);
    }
    if (cipherMode) {
        cipher = forge.cipher.createCipher(forgeCryptoAlgo, keyBuffer);
    }
    else {
        cipher = forge.cipher.createDecipher(forgeCryptoAlgo, keyBuffer);
    }
    cipher.start({ iv: toForgeBuffer(iv) });
    cipher.update(toForgeBuffer(data));
    cipher.finish();
    return new Buffer(cipher.output.toHex().substring(0, data.length * 2), 'hex');
}
function doNodeJsCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, iv) {
    var cipher;
    var nodeJsCryptoAlgo = getNodeJsSymCryptoAlgorithm(key, aCipherAlgo, aBlockCipherMode);
    if (cipherMode) {
        cipher = require('crypto').createCipheriv(nodeJsCryptoAlgo, key, iv);
    }
    else {
        cipher = require('crypto').createDecipheriv(nodeJsCryptoAlgo, key, iv);
    }
    cipher.setAutoPadding(false);
    return Buffer.concat([cipher.update(data), cipher.final()]);
}
function doCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    var dataToProcess = data;
    var iv = cipherOpts && cipherOpts.iv ? cipherOpts.iv : null;
    var cipher = null;
    if (cipherMode && cipherOpts && cipherOpts.padding) {
        dataToProcess = cipherOpts.padding.pad(data, aCipherAlgo.blockSize);
    }
    if (!iv) {
        iv = genNullIv(aBlockCipherMode.hasIV ? aCipherAlgo.blockSize : 0);
    }
    var result = doForgeCipher(cipherMode, key, dataToProcess, aCipherAlgo, aBlockCipherMode, iv);
    if (!cipherMode && cipherOpts && cipherOpts.padding) {
        return cipherOpts.padding.unpad(result);
    }
    else {
        return result;
    }
}
function computeKcv(key, cipherAlgo, length) {
    if (length && length > cipherAlgo.blockSize) {
        error.raiseInvalidArg("Invalid KCV length " + length + " must be lower or equal than " + cipherAlgo.blockSize);
    }
    var data = new Buffer(cipherAlgo.blockSize);
    data.fill(0);
    var encData = doCipher(true, key, data, cipherAlgo, blockCipherMode.ecb, { padding: padding.noPadding });
    var result = util.toHex(encData);
    return length ? result.substr(0, length * 2) : result;
}
var cipher = {
    cipherAlgo: cipherAlgo,
    blockCipherMode: blockCipherMode,
    cipher: doCipher,
    computeKcv: computeKcv
};
module.exports = cipher;
//# sourceMappingURL=cryptolib-cipher.js.map