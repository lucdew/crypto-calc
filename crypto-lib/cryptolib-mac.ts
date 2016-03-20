/// <reference path="./cryptolib.d.ts"/>


import error = require('./cryptolib-error');
import util = require('./cryptolib-util');
import messageDigest = require('./cryptolib-message-digest');

function blockCipherMac(key: Buffer, data: Buffer): Buffer {

    return null;
}

function doHmac(aMessageDigest: Cryptolib.MessageDigest.IMessageDigestType, key: Buffer, data: Buffer) {

    var blockSizeInBytes = aMessageDigest.blockSize / 8;

    if (key.length > blockSizeInBytes) {
        key = messageDigest.digest(aMessageDigest, key); // keys longer than blocksize are shortened
    }

    if (key.length < blockSizeInBytes) {
        var paddedKeyHex = util.rightPad(key.toString('hex'), blockSizeInBytes * 2, '0');
        key = new Buffer(paddedKeyHex, 'hex');
    }

    var oKeyPad = new Buffer(blockSizeInBytes);
    oKeyPad.fill(0x5c);
    oKeyPad = util.xor(key, oKeyPad); // Where blocksize is that of the underlying hash function

    var iKeyPad = new Buffer(blockSizeInBytes);
    iKeyPad.fill(0x36);
    iKeyPad = util.xor(key, iKeyPad); // Where blocksize is that of the underlying hash function

    var xorIKeyPadMessage = messageDigest.digest(aMessageDigest, Buffer.concat([iKeyPad, data]));
    return messageDigest.digest(aMessageDigest, Buffer.concat([oKeyPad, xorIKeyPadMessage]));


}

function hmac(aMessageDigest: Cryptolib.MessageDigest.IMessageDigestType, key: Buffer, data: Buffer): Buffer {
    return doHmac(aMessageDigest, key, data);
}

var mac: Cryptolib.Mac.IMacStatic = {
    blockCipherMac: blockCipherMac,
    hmac: hmac
}

export = mac