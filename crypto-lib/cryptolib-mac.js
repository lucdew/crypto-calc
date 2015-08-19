var util = require('./cryptolib-util');
var messageDigest = require('./cryptolib-message-digest');
function blockCipherMac(key, data) {
    return null;
}
function doHmac(aMessageDigest, key, data) {
    var blockSizeInBytes = aMessageDigest.blockSize / 8;
    if (key.length > blockSizeInBytes) {
        key = messageDigest.digest(aMessageDigest, key);
    }
    if (key.length < blockSizeInBytes) {
        var paddedKeyHex = util.rightPad(key.toString('hex'), blockSizeInBytes * 2, '0');
        key = new Buffer(paddedKeyHex, 'hex');
    }
    var oKeyPad = new Buffer(blockSizeInBytes);
    oKeyPad.fill(0x5c);
    oKeyPad = util.xor(key, oKeyPad);
    var iKeyPad = new Buffer(blockSizeInBytes);
    iKeyPad.fill(0x36);
    iKeyPad = util.xor(key, iKeyPad);
    var xorIKeyPadMessage = messageDigest.digest(aMessageDigest, Buffer.concat([iKeyPad, data]));
    return messageDigest.digest(aMessageDigest, Buffer.concat([oKeyPad, xorIKeyPadMessage]));
}
function hmac(aMessageDigest, key, data) {
    return doHmac(aMessageDigest, key, data);
}
var mac = {
    blockCipherMac: blockCipherMac,
    hmac: hmac
};
module.exports = mac;
//# sourceMappingURL=cryptolib-mac.js.map