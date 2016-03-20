/// <reference path='./cryptolib.d.ts'/>

import error = require('./cryptolib-error');
import util = require('./cryptolib-util');
import padding = require('./cryptolib-padding');
import forgelib = require('./forgelib');
import cryptojslib = require('./cryptojslib');
import random = require('./cryptolib-random');

var CryptoJS = cryptojslib.CryptoJS;


var blockCipherMode: Cryptolib.Cipher.IBlockCipherModeStatic = {
    ecb: {
        name: 'ECB',
        cryptoName: 'ecb',
        hasIV: false,
        isAuthenticatedEncryption: false,
        isStreaming: false
    },
    cbc: {
        name: 'CBC',
        cryptoName: 'cbc',
        hasIV: true,
        isAuthenticatedEncryption: false,
        isStreaming: false
    },
    cfb: {
        name: 'CFB',
        cryptoName: 'cfb',
        hasIV: true,
        isAuthenticatedEncryption: false,
        isStreaming: false
    },
    ofb: {
        name: 'OFB',
        cryptoName: 'ofb',
        hasIV: true,
        isAuthenticatedEncryption: false,
        isStreaming: true
    },
    ctr: {
        name: 'CTR',
        cryptoName: 'ctr',
        hasIV: true,
        isAuthenticatedEncryption: false,
        isStreaming: true
    },
    gcm: {
        name: 'GCM',
        cryptoName: 'gcm',
        hasIV: true,
        isAuthenticatedEncryption: true,
        isStreaming: true,
        supportedBlockSizes: [16]
    }

}

var cipherAlgo: Cryptolib.Cipher.ICipherAlgoStatic = {
    aes: {
        blockSize: 16,
        name: 'AES',
        cryptoName: 'aes',
        keyLengths: [128, 192, 256],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr, blockCipherMode.gcm]
    },
    des: {
        blockSize: 8,
        name: 'DES',
        cryptoName: 'des',
        keyLengths: [64],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc]
    },
    desede: {
        blockSize: 8,
        name: '3DES',
        cryptoName: 'des-ede',
        keyLengths: [64, 128, 192],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr]
    }
}


function genNullIv(length: number): Buffer {
    var iv = new Buffer(length);
    iv.fill(0);
    return iv;
}

function getNodeJsSymCryptoAlgorithm(key: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode) {

    var algo = aCipherAlgo.cryptoName;
    if (aCipherAlgo === cipherAlgo.desede && key.length === 192) {
        algo += '3'; // DESEDE with triple keys
    } else if (aCipherAlgo === cipherAlgo.aes) {
        algo += '-' + key.length * 8;
    }
    if (aBlockCipherMode === blockCipherMode.ecb && aCipherAlgo !== cipherAlgo.aes) {
        return algo;
    }
    algo += '-';
    algo += aBlockCipherMode.cryptoName;

    return algo;

}

function toDoubleLengthKey(key: Buffer) {
    var mykey = new Buffer(24);
    key.copy(mykey, 0, 0, 16);
    key.copy(mykey, 16, 0, 8);
    return mykey;
}


function doCryptoJSCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, cipherOpts: Cryptolib.Cipher.ICipherOptions): Cryptolib.Cipher.ICipherResult {

    if (aBlockCipherMode === blockCipherMode.gcm) {
        error.raiseInvalidArg('GCM block cipher mode of operation is not supported by CryptoJS library');
    }
    var keyHex: string;
    if (aCipherAlgo == cipherAlgo.desede && key.length == 16) {
        keyHex = toDoubleLengthKey(key).toString('hex');
    } else {
        keyHex = key.toString('hex');
    }
    var dataWord = CryptoJS.enc.Hex.parse(data.toString('hex'));
    var keyWord = CryptoJS.enc.Hex.parse(keyHex);
    var algo = aCipherAlgo.name;
    if (aCipherAlgo === cipherAlgo.desede) {
        algo = 'TripleDES';
    }
    var cryptoJsOpts: any = {};
    cryptoJsOpts.mode = CryptoJS.mode[aBlockCipherMode.name];
    cryptoJsOpts.padding = CryptoJS.pad.NoPadding;
    if (cipherOpts.iv) {
        cryptoJsOpts.iv = CryptoJS.enc.Hex.parse(cipherOpts.iv.toString('hex'));
    }
    if (cipherMode) {
        var encrypted = CryptoJS[algo].encrypt(dataWord, keyWord, cryptoJsOpts);
        return {
            data: new Buffer(encrypted.ciphertext.toString(CryptoJS.enc.Hex), 'hex')
        }
    } else {

        var decrypted = CryptoJS[algo].decrypt({
            ciphertext: dataWord,
            salt: ''
        }, keyWord, cryptoJsOpts);
        return {
            data: new Buffer(decrypted.toString(CryptoJS.enc.Hex), 'hex')
        }
    }

}


function getForgeCryptoAlgo(aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode) {

    var forgeCryptoAlgo: string = null;
    if (aCipherAlgo == cipherAlgo.aes) {
        forgeCryptoAlgo = 'AES-';
    } else if (aCipherAlgo == cipherAlgo.des || aCipherAlgo == cipherAlgo.desede) {
        forgeCryptoAlgo = 'DES-';
    } else {
        error.raiseInvalidArg('Unexpected cipher algo ' + cipherAlgo);
    }

    forgeCryptoAlgo += aBlockCipherMode.name;

    return forgeCryptoAlgo;

}

function doForgeCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, cipherOpts: Cryptolib.Cipher.ICipherOptions): Cryptolib.Cipher.ICipherResult {

    var cipher: any;

    var forgeCryptoAlgo = getForgeCryptoAlgo(aCipherAlgo, aBlockCipherMode);
    var keyBuffer = forgelib.toForgeBuffer(key);

    if (aCipherAlgo == cipherAlgo.desede && key.length == 16) {
        var mykey = toDoubleLengthKey(key);
        keyBuffer = forgelib.toForgeBuffer(mykey);
    }

    if (cipherMode) {
        cipher = forgelib.forge.cipher.createCipher(forgeCryptoAlgo, keyBuffer);
    } else {
        cipher = forgelib.forge.cipher.createDecipher(forgeCryptoAlgo, keyBuffer);
    }
    var forgeOpts: any = {};
    if (cipherOpts.iv) {
        forgeOpts.iv = forgelib.toForgeBuffer(cipherOpts.iv);
    }
    if (cipherOpts.additionalAuthenticatedData) {
        forgeOpts.additionalData = forgelib.toForgeBuffer(cipherOpts.additionalAuthenticatedData);
        if (!cipherMode) {
            if (!cipherOpts.authenticationTag) {
                error.raiseInvalidArg('Authentication tag is missing for block cipher mode ' + aBlockCipherMode.name);
            }
            forgeOpts.tag = forgelib.toForgeBuffer(cipherOpts.authenticationTag);
        }
    }
    if (aBlockCipherMode === blockCipherMode.gcm) {
        forgeOpts.tagLength = 128;
    }
    cipher.start(forgeOpts);
    cipher.update(forgelib.toForgeBuffer(data));
    var pass = cipher.finish();

    if (aBlockCipherMode.isAuthenticatedEncryption && !cipherMode && !pass) {
        throw new error.CryptoError(error.AUTHENTICATED_TAG_INVALID);
    }

    // awful substring since forge returns more than expected
    // might be due to their ByteStringBuffer implementation, move to DataBuffer
    // when they support if
    var result: Cryptolib.Cipher.ICipherResult = {
        data: new Buffer(cipher.output.toHex().substring(0, data.length * 2), 'hex')
    };

    if (aBlockCipherMode.isAuthenticatedEncryption && cipherMode) {
        result.authenticationTag = new Buffer(cipher.mode.tag.toHex(), 'hex');
    }
    return result;
}

function doNodeJsCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, iv: Buffer) {

    var cipher: any;
    var nodeJsCryptoAlgo = getNodeJsSymCryptoAlgorithm(key, aCipherAlgo, aBlockCipherMode);
    if (cipherMode) {
        cipher = require('crypto').createCipheriv(nodeJsCryptoAlgo, key, iv);
    } else {
        cipher = require('crypto').createDecipheriv(nodeJsCryptoAlgo, key, iv);
    }

    cipher.setAutoPadding(false);

    return Buffer.concat([cipher.update(data), cipher.final()]);
}

function cipher(key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, cipherOpts: Cryptolib.Cipher.ICipherOptions) {
    return doCipher(true, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
}

function decipher(key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, cipherOpts: Cryptolib.Cipher.ICipherOptions) {
    return doCipher(false, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
}

function doCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: Cryptolib.Cipher.ICipherAlgo,
    aBlockCipherMode: Cryptolib.Cipher.IBlockCipherMode, cipherOpts: Cryptolib.Cipher.ICipherOptions): Cryptolib.Cipher.ICipherResult {

    if (aCipherAlgo.modes.indexOf(aBlockCipherMode) < 0) {
        error.raiseInvalidArg('The block cipher ' + aBlockCipherMode.name + ' is not valid for cipher algo ' + aCipherAlgo.name);
    }
    var dataToProcess = data;
    var iv: Buffer = cipherOpts && cipherOpts.iv ? cipherOpts.iv : null;
    if (cipherMode && cipherOpts && cipherOpts.padding) {
        dataToProcess = cipherOpts.padding.pad(data, aCipherAlgo.blockSize);
    }

    if (!iv && aBlockCipherMode.hasIV) {
        if (aBlockCipherMode === blockCipherMode.cbc || aBlockCipherMode === blockCipherMode.cfb || aBlockCipherMode === blockCipherMode.ofb || aBlockCipherMode === blockCipherMode.ctr) {
            iv = genNullIv(aCipherAlgo.blockSize);
            cipherOpts.iv = iv;
        } else if (aBlockCipherMode === blockCipherMode.ctr || aBlockCipherMode === blockCipherMode.gcm) {
            if (cipherMode) {
                iv = new Buffer(16);
                random.generate(12).copy(iv);
                iv.fill(0, 12, 16);
            } else {
                // Assume null iv is wanted
                iv = genNullIv(16);
            }
            cipherOpts.iv = iv;
        }
    }

    //var result = doNodeJsCipher(cipherMode,key,dataToProcess,aCipherAlgo,aBlockCipherMode,iv);

    // only use forge so far for GCM cipher mode
    var cipherResult = aBlockCipherMode === blockCipherMode.gcm ?
        doForgeCipher(cipherMode, key, dataToProcess, aCipherAlgo, aBlockCipherMode, cipherOpts) :
        doCryptoJSCipher(cipherMode, key, dataToProcess, aCipherAlgo, aBlockCipherMode, cipherOpts);

    if (!cipherMode && cipherOpts && cipherOpts.padding) {
        cipherResult.data = cipherOpts.padding.unpad(cipherResult.data);
    }

    if (iv) {
        cipherResult.iv = iv;
    }
    return cipherResult;


}

function computeKcv(key: Buffer, cipherAlgo: Cryptolib.Cipher.ICipherAlgo, length ? : number): string {
    if (length && length > cipherAlgo.blockSize) {
        error.raiseInvalidArg(`Invalid KCV length ${length} must be lower or equal than ${cipherAlgo.blockSize}`);
    }


    var data = new Buffer(cipherAlgo.blockSize);
    data.fill(0);
    var encData = doCipher(true, key, data, cipherAlgo, blockCipherMode.ecb, {
        padding: padding.noPadding
    });
    var result = util.toHex(encData.data);
    return length ? result.substr(0, length * 2) : result;
}

function adjustByte(abyte: number) {
    var numOdd = 0;
    for (var i = 0; i < 8; i++) {
        numOdd ^= abyte >>> i & 0x01;
    }
    return numOdd == 1 ? abyte : abyte ^ 0x01;
}

function checkAndAdjustParity(key: Buffer): Cryptolib.Cipher.IParityCheck {
    var validity = true;
    var adjustedKey = new Buffer(key.length);
    for (var i = 0; i < key.length; i++) {
        var adjustedByte = adjustByte(key[i]);
        adjustedKey[i] = adjustedByte;
    }

    return {
        valid: adjustedKey.toString('hex') === key.toString('hex'),
        adjustedKey: adjustedKey
    }

}

var cipherModule: Cryptolib.Cipher.ICipherStatic = {
    cipherAlgo: cipherAlgo,
    blockCipherMode: blockCipherMode,
    cipher: cipher,
    decipher: decipher,
    computeKcv: computeKcv,
    checkAndAdjustParity: checkAndAdjustParity
}

export = cipherModule;