(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.webcryptolib = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/// <reference path="../d.ts/node/node.d.ts"/>
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
if (nodejs) {
    exports.CryptoJS = require('crypto-js');
}
else {
    exports.CryptoJS = window.CryptoJS;
}

}).call(this,require('_process'))
},{"_process":17,"crypto-js":undefined}],2:[function(require,module,exports){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var error = require('./cryptolib-error');
var util = require('./cryptolib-util');
function mod10ComputeCheckDigit(apan) {
    var sum = 0;
    apan.split('').reverse().forEach(function (value, index) {
        if (index % 2 === 0) {
            var doubledDigit = parseInt(value, 10) * 2;
            sum += (doubledDigit > 9 ? (doubledDigit - 9) : doubledDigit);
        }
        else {
            sum += parseInt(value, 10);
        }
    });
    var sumMod10 = sum % 10;
    return sumMod10 === 0 ? '0' : (10 - sumMod10).toString();
}
var Pan = (function () {
    function Pan() {
    }
    Pan.prototype.formatForIso9564Pin = function () {
        var last13Digits = util.takeLast(this.rawValue, 13);
        return last13Digits.substring(0, 12);
    };
    Pan.prototype.isValid = function () {
        return mod10ComputeCheckDigit(this.rawValue.substring(0, this.rawValue.length - 1)) === this.rawValue.substring(this.rawValue.length - 1);
    };
    Pan.fromString = function (pan) {
        var aPan = new Pan();
        aPan.issuerIdentificationNumber = pan.substring(0, 6);
        aPan.majorIndustryIdentifer = pan.substring(0, 1);
        aPan.bankIdentificationNumber = aPan.issuerIdentificationNumber;
        var panWithoutIssuer = pan.substring(6);
        aPan.individualAccountIdentifier = panWithoutIssuer.substring(0, panWithoutIssuer.length - 1);
        aPan.checkDigit = pan.substring(pan.length - 1);
        aPan.rawValue = pan;
        var allNetworks = issuingNetwork.getAll();
        for (var i = 0; i < allNetworks.length; i++) {
            if (allNetworks[i].iinRegexp.test(pan)) {
                var exclusions = allNetworks[i].exclusions;
                var excluded = false;
                for (var j = 0; exclusions && j < exclusions.length && !excluded; j++) {
                    excluded = exclusions[j].test(pan);
                }
                if (!excluded) {
                    aPan.issuingNetwork = allNetworks[i];
                    break;
                }
            }
        }
        ;
        if (!aPan.issuingNetwork) {
            error.raiseInvalidArg('PAN is not issued');
        }
        return aPan;
    };
    return Pan;
})();
var issuingNetwork = {
    Amex: {
        name: 'American Express',
        iinRegexp: /^3[47]\d{13}$/,
        active: true,
        lengths: {
            min: 15,
            max: 15
        }
    },
    Bankcard: {
        name: 'Bankcard',
        iinRegexp: /^(5610\d{12}|56022[1-5]\d{10})$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    ChinaUnionPay: {
        name: 'China UnionPay',
        iinRegexp: /^62\d{14,17}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    DinersClubCarteBlanche: {
        name: 'Diners Club Carte Blanche',
        iinRegexp: /^30[0-5]\d{11}$/,
        active: true,
        lengths: {
            min: 14,
            max: 14
        }
    },
    DinersClubEnRoute: {
        name: 'Diners Club En Route',
        iinRegexp: /^(2014|2149)\d{11}$/,
        active: false,
        lengths: {
            min: 15,
            max: 15
        }
    },
    DinersClubInternational: {
        name: 'Diners Club International',
        iinRegexp: /^(30[0-5]\d{11}|309\d{11}|36\d{12}|3[8-9]\d{12})$/,
        active: true,
        lengths: {
            min: 14,
            max: 14
        }
    },
    DiscoverCard: {
        name: 'Discover Card',
        iinRegexp: /^(6011\d{12}|62212[6-9]\d{10}|6221[3-9][0-9]\d{10}|622[3-8][0-9][0-9]\d{10}|6229[01][0-9]\d{10}|62292[0-5]\d{10}|64[4-9]\d{13}|65\d{14})$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    InterPayment: {
        name: 'InterPayment',
        iinRegexp: /^636\d{13,16}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    InstaPayment: {
        name: 'InstaPayment',
        iinRegexp: /^63[7-9]\d{13,16}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    JCB: {
        name: 'JCB',
        iinRegexp: /^(352[8-9]{12}|35[3-8][0-9]\d{12})$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    Laser: {
        name: 'Laser',
        iinRegexp: /^(6304\d{12,15}|6706\d{12,15}|6771\d{12,15}|6709\d{12,15})$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Maestro: {
        name: 'Maestro',
        iinRegexp: /^(50[0-9][0-9][0-9][0-9]\d{6,13}|5[6-9][0-9][0-9][0-9][0-9]\d{6,13}|6[0-9][0-9][0-9][0-9][0-9]\d{6,13})$/,
        active: true,
        exclusions: [
            /^60110[0-9]\d{6,13}$/,
            /^6011[234][0-9]\d{6,13}$/,
            /^601174\d{6,13}$/,
            /^60117[7-9]\d{6,13}$/,
            /^(60118[6-9]\d{6,13}|60119[0-9]\d{6,13})$/,
            /^64[4-9][0-9][0-9][0-9]\d{6,13}$/,
            /^65[0-9][0-9][0-9][0-9]\d{6,13}$/
        ],
        lengths: {
            min: 12,
            max: 19
        }
    },
    Dankort: {
        name: 'Dankort',
        iinRegexp: /^5019\d{12}$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    MasterCardNotActive: {
        name: 'Mastercard',
        iinRegexp: /^(222[1-9][0-9][0-9]\d{10}|22[3-6][0-9][0-9][0-9]\d{10}|227[0-1][0-9][0-9]\d{10}|22720[0-9][0-9]\d{10})$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    MasterCard: {
        name: 'MasterCard',
        iinRegexp: /^5[1-5]\d{14}$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    Solo: {
        name: 'Solo',
        iinRegexp: /^6334-6767\d{12,15}$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Switch: {
        name: 'Switch',
        iinRegexp: /^(4903\d{12,15}|4905\d{12,15}|4911\d{12,15}|4936\d{12,15}|564182\d{10,13}|633110\d{10,13}|6333\d{12,15}|6759\d{12,15})$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Visa: {
        name: 'Visa',
        iinRegexp: /^4\d{12,15}$/,
        active: true,
        lengths: {
            min: 13,
            max: 16
        }
    },
    UATP: {
        name: 'UATP',
        iinRegexp: /^1\d{14}$/,
        active: true,
        lengths: {
            min: 15,
            max: 15
        }
    },
    getAll: function () {
        return [
            issuingNetwork.Amex,
            issuingNetwork.Bankcard,
            issuingNetwork.ChinaUnionPay,
            issuingNetwork.Dankort,
            issuingNetwork.DinersClubEnRoute,
            issuingNetwork.DinersClubInternational,
            issuingNetwork.DiscoverCard,
            issuingNetwork.MasterCard,
            issuingNetwork.InstaPayment,
            issuingNetwork.InterPayment,
            issuingNetwork.JCB,
            issuingNetwork.Laser,
            issuingNetwork.Maestro,
            issuingNetwork.MasterCard,
            issuingNetwork.MasterCardNotActive,
            issuingNetwork.Solo,
            issuingNetwork.Switch,
            issuingNetwork.UATP,
            issuingNetwork.Visa
        ];
    }
};
var banking = {
    createPanFromString: function (pan) {
        return Pan.fromString(pan);
    },
    computeCheckDigit: function (pan) {
        return mod10ComputeCheckDigit(pan);
    },
    issuingNetwork: issuingNetwork
};
module.exports = banking;

},{"./cryptolib-error":4,"./cryptolib-util":11}],3:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var error = require('./cryptolib-error');
var util = require('./cryptolib-util');
var padding = require('./cryptolib-padding');
var forgelib = require('./forgelib');
var cryptojslib = require('./cryptojslib');
var random = require('./cryptolib-random');
var CryptoJS = cryptojslib.CryptoJS;
var blockCipherMode = {
    ecb: { name: 'ECB', cryptoName: 'ecb', hasIV: false, isAuthenticatedEncryption: false, isStreaming: false },
    cbc: { name: 'CBC', cryptoName: 'cbc', hasIV: true, isAuthenticatedEncryption: false, isStreaming: false },
    cfb: { name: 'CFB', cryptoName: 'cfb', hasIV: true, isAuthenticatedEncryption: false, isStreaming: false },
    ofb: { name: 'OFB', cryptoName: 'ofb', hasIV: true, isAuthenticatedEncryption: false, isStreaming: true },
    ctr: { name: 'CTR', cryptoName: 'ctr', hasIV: true, isAuthenticatedEncryption: false, isStreaming: true },
    gcm: { name: 'GCM', cryptoName: 'gcm', hasIV: true, isAuthenticatedEncryption: true, isStreaming: true, supportedBlockSizes: [16] }
};
var cipherAlgo = {
    aes: { blockSize: 16, name: 'AES', cryptoName: 'aes', keyLengths: [128, 192, 256],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr, blockCipherMode.gcm] },
    des: { blockSize: 8, name: 'DES', cryptoName: 'des', keyLengths: [64],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc] },
    desede: { blockSize: 8, name: '3DES', cryptoName: 'des-ede', keyLengths: [64, 128, 192],
        modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr] }
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
function toDoubleLengthKey(key) {
    var mykey = new Buffer(24);
    key.copy(mykey, 0, 0, 16);
    key.copy(mykey, 16, 0, 8);
    return mykey;
}
function doCryptoJSCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    if (aBlockCipherMode === blockCipherMode.gcm) {
        error.raiseInvalidArg("GCM block cipher mode of operation is not supported by CryptoJS library");
    }
    var keyHex;
    if (aCipherAlgo == cipherAlgo.desede && key.length == 16) {
        keyHex = toDoubleLengthKey(key).toString('hex');
    }
    else {
        keyHex = key.toString('hex');
    }
    var dataWord = CryptoJS.enc.Hex.parse(data.toString('hex'));
    var keyWord = CryptoJS.enc.Hex.parse(keyHex);
    var algo = aCipherAlgo.name;
    if (aCipherAlgo === cipherAlgo.desede) {
        algo = "TripleDES";
    }
    var cryptoJsOpts = {};
    cryptoJsOpts.mode = CryptoJS.mode[aBlockCipherMode.name];
    cryptoJsOpts.padding = CryptoJS.pad.NoPadding;
    if (cipherOpts.iv) {
        cryptoJsOpts.iv = CryptoJS.enc.Hex.parse(cipherOpts.iv.toString('hex'));
    }
    if (cipherMode) {
        var encrypted = CryptoJS[algo].encrypt(dataWord, keyWord, cryptoJsOpts);
        return {
            data: new Buffer(encrypted.ciphertext.toString(CryptoJS.enc.Hex), 'hex')
        };
    }
    else {
        var decrypted = CryptoJS[algo].decrypt({ ciphertext: dataWord, salt: "" }, keyWord, cryptoJsOpts);
        return {
            data: new Buffer(decrypted.toString(CryptoJS.enc.Hex), 'hex')
        };
    }
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
function doForgeCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    var cipher;
    var forgeCryptoAlgo = getForgeCryptoAlgo(aCipherAlgo, aBlockCipherMode);
    var keyBuffer = forgelib.toForgeBuffer(key);
    if (aCipherAlgo == cipherAlgo.desede && key.length == 16) {
        var mykey = toDoubleLengthKey(key);
        keyBuffer = forgelib.toForgeBuffer(mykey);
    }
    if (cipherMode) {
        cipher = forgelib.forge.cipher.createCipher(forgeCryptoAlgo, keyBuffer);
    }
    else {
        cipher = forgelib.forge.cipher.createDecipher(forgeCryptoAlgo, keyBuffer);
    }
    var forgeOpts = {};
    if (cipherOpts.iv) {
        forgeOpts.iv = forgelib.toForgeBuffer(cipherOpts.iv);
    }
    if (cipherOpts.additionalAuthenticatedData) {
        forgeOpts.additionalData = forgelib.toForgeBuffer(cipherOpts.additionalAuthenticatedData);
        if (!cipherMode) {
            if (!cipherOpts.authenticationTag) {
                error.raiseInvalidArg("Authentication tag is missing for block cipher mode " + aBlockCipherMode.name);
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
    var result = {
        data: new Buffer(cipher.output.toHex().substring(0, data.length * 2), 'hex')
    };
    if (aBlockCipherMode.isAuthenticatedEncryption && cipherMode) {
        result.authenticationTag = new Buffer(cipher.mode.tag.toHex(), 'hex');
    }
    return result;
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
function cipher(key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    return doCipher(true, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
}
function decipher(key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    return doCipher(false, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
}
function doCipher(cipherMode, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts) {
    if (aCipherAlgo.modes.indexOf(aBlockCipherMode) < 0) {
        error.raiseInvalidArg("The block cipher " + aBlockCipherMode.name + " is not valid for cipher algo " + aCipherAlgo.name);
    }
    var dataToProcess = data;
    var iv = cipherOpts && cipherOpts.iv ? cipherOpts.iv : null;
    if (cipherMode && cipherOpts && cipherOpts.padding) {
        dataToProcess = cipherOpts.padding.pad(data, aCipherAlgo.blockSize);
    }
    if (!iv && aBlockCipherMode.hasIV) {
        if (aBlockCipherMode === blockCipherMode.cbc || aBlockCipherMode === blockCipherMode.cfb
            || aBlockCipherMode === blockCipherMode.ofb || aBlockCipherMode === blockCipherMode.ctr) {
            iv = genNullIv(aCipherAlgo.blockSize);
            cipherOpts.iv = iv;
        }
        else if (aBlockCipherMode === blockCipherMode.ctr || aBlockCipherMode === blockCipherMode.gcm) {
            if (cipherMode) {
                iv = new Buffer(16);
                random.generate(12).copy(iv);
                iv.fill(0, 12, 16);
            }
            else {
                iv = genNullIv(16);
            }
            cipherOpts.iv = iv;
        }
    }
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
function computeKcv(key, cipherAlgo, length) {
    if (length && length > cipherAlgo.blockSize) {
        error.raiseInvalidArg("Invalid KCV length " + length + " must be lower or equal than " + cipherAlgo.blockSize);
    }
    var data = new Buffer(cipherAlgo.blockSize);
    data.fill(0);
    var encData = doCipher(true, key, data, cipherAlgo, blockCipherMode.ecb, { padding: padding.noPadding });
    var result = util.toHex(encData.data);
    return length ? result.substr(0, length * 2) : result;
}
function adjustByte(abyte) {
    var numOdd = 0;
    for (var i = 0; i < 8; i++) {
        numOdd ^= abyte >>> i & 0x01;
    }
    return numOdd == 1 ? abyte : abyte ^ 0x01;
}
function checkAndAdjustParity(key) {
    var validity = true;
    var adjustedKey = new Buffer(key.length);
    for (var i = 0; i < key.length; i++) {
        var adjustedByte = adjustByte(key[i]);
        adjustedKey[i] = adjustedByte;
    }
    return {
        valid: adjustedKey.toString('hex') === key.toString('hex'),
        adjustedKey: adjustedKey
    };
}
var cipherModule = {
    cipherAlgo: cipherAlgo,
    blockCipherMode: blockCipherMode,
    cipher: cipher,
    decipher: decipher,
    computeKcv: computeKcv,
    checkAndAdjustParity: checkAndAdjustParity
};
module.exports = cipherModule;

}).call(this,require("buffer").Buffer)
},{"./cryptojslib":1,"./cryptolib-error":4,"./cryptolib-padding":8,"./cryptolib-random":10,"./cryptolib-util":11,"./forgelib":12,"buffer":13,"crypto":undefined}],4:[function(require,module,exports){
/// <reference path="./cryptolib.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CryptoError = (function (_super) {
    __extends(CryptoError, _super);
    function CryptoError(code, message) {
        _super.call(this, message || code.description || code.name);
        this.message = message || code.description || code.name;
        this.code = code;
        this.name = 'CryptoError';
        var stack = (new Error()).stack;
        this.stack = stack.replace(/\n[^\n]*/, '');
    }
    CryptoError.prototype.getCode = function () {
        return this.code;
    };
    CryptoError.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return CryptoError;
})(Error);
function raiseInvalidArg(msg) {
    throw new CryptoError(INVALID_ARGUMENT, msg);
}
var INVALID_ARGUMENT = {
    value: 0,
    name: "INVALID_ARGUMENT",
    description: "Invalid argument" };
var INVALID_PADDING = {
    value: 1,
    name: "INVALID_PADDING",
    description: "Invalid padding" };
var INVALID_BLOCK_SIZE = {
    value: 2,
    name: "INVALID_BLOCK_SIZE",
    description: "Invalid block size" };
var INVALID_KEY_SIZE = {
    value: 3,
    name: "INVALID_KEY_SIZE",
    description: "Invalid key size" };
var PAN_MISSING = {
    value: 4,
    name: "PAN_MISSING",
    description: "Pan is missing" };
var PAN_MISSING = {
    value: 5,
    name: "PAN_MISSING",
    description: "Pan is missing" };
var AUTHENTICATED_TAG_INVALID = {
    value: 6,
    name: "AUTHENTICATED_TAG_INVALID",
    description: "Authenticated tag is invalid" };
var error = {
    CryptoError: CryptoError,
    INVALID_ARGUMENT: INVALID_ARGUMENT,
    INVALID_PADDING: INVALID_PADDING,
    INVALID_BLOCK_SIZE: INVALID_BLOCK_SIZE,
    INVALID_KEY_SIZE: INVALID_KEY_SIZE,
    PAN_MISSING: PAN_MISSING,
    AUTHENTICATED_TAG_INVALID: AUTHENTICATED_TAG_INVALID,
    raiseInvalidArg: raiseInvalidArg
};
module.exports = error;

},{}],5:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
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

}).call(this,require("buffer").Buffer)
},{"./cryptolib-message-digest":6,"./cryptolib-util":11,"buffer":13}],6:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var error = require('./cryptolib-error');
var forgelib = require('./forgelib');
var cryptojslib = require('./cryptojslib');
var CryptoJS = cryptojslib.CryptoJS;
var messageDigestType = {
    MD5: { name: 'MD5', digestSize: 128, blockSize: 512, security: 64 },
    SHA1: { name: 'SHA1', digestSize: 160, blockSize: 512, security: 80 },
    SHA2_224: { name: 'SHA2_224', digestSize: 224, blockSize: 512, security: 112 },
    SHA2_256: { name: 'SHA2_256', digestSize: 256, blockSize: 512, security: 128 },
    SHA2_384: { name: 'SHA2_384', digestSize: 384, blockSize: 1024, security: 192 },
    SHA2_512: { name: 'SHA2_512', digestSize: 512, blockSize: 1024, security: 256 },
    SHA2_512_224: { name: 'SHA2_512_224', digestSize: 224, blockSize: 1024, security: 112 },
    SHA2_512_256: { name: 'SHA2_512_256', digestSize: 256, blockSize: 1024, security: 128 },
    SHA3_224: { name: 'SHA3_224', digestSize: 224, blockSize: 1152, security: 112 },
    SHA3_256: { name: 'SHA3_256', digestSize: 256, blockSize: 1088, security: 128 },
    SHA3_384: { name: 'SHA3_384', digestSize: 384, blockSize: 832, security: 192 },
    SHA3_512: { name: 'SHA3_512', digestSize: 512, blockSize: 576, security: 256 }
};
var messageDigest = {
    digest: function (messageDigest, data) {
        var word = CryptoJS.enc.Hex.parse(data.toString('hex'));
        var hash;
        if (messageDigest == messageDigestType.MD5) {
            hash = CryptoJS.MD5(word);
        }
        else if (messageDigest == messageDigestType.SHA1) {
            hash = CryptoJS.SHA1(word);
        }
        else if (messageDigest == messageDigestType.SHA2_224) {
            hash = CryptoJS.SHA224(word);
        }
        else if (messageDigest == messageDigestType.SHA2_256) {
            hash = CryptoJS.SHA256(word);
        }
        else if (messageDigest == messageDigestType.SHA2_384) {
            hash = CryptoJS.SHA384(word);
        }
        else if (messageDigest == messageDigestType.SHA2_512) {
            hash = CryptoJS.SHA512(word);
        }
        else if (messageDigest == messageDigestType.SHA2_512_224) {
            var md = forgelib.forge.sha512.sha224.create();
            md.update(forgelib.bufferToString(data));
            return new Buffer(md.digest().toHex(), 'hex');
        }
        else if (messageDigest == messageDigestType.SHA2_512_256) {
            var md = forgelib.forge.sha512.sha256.create();
            md.update(forgelib.bufferToString(data));
            return new Buffer(md.digest().toHex(), 'hex');
        }
        else if (messageDigest.name.indexOf('SHA3') == 0) {
            hash = CryptoJS.SHA3(word, { outputLength: messageDigest.digestSize });
        }
        else {
            error.raiseInvalidArg("Unsupported message digest " + messageDigest.name ? messageDigest.name : 'null');
        }
        return new Buffer(hash.toString(CryptoJS.enc.Hex), 'hex');
    },
    messageDigestType: messageDigestType
};
module.exports = messageDigest;

}).call(this,require("buffer").Buffer)
},{"./cryptojslib":1,"./cryptolib-error":4,"./forgelib":12,"buffer":13}],7:[function(require,module,exports){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var error = require('./cryptolib-error');
var random = require('./cryptolib-random');
var padding = require('./cryptolib-padding');
var util = require('./cryptolib-util');
var banking = require('./cryptolib-banking');
var cipher = require('./cryptolib-cipher');
var pin = require('./cryptolib-pin');
var messageDigest = require('./cryptolib-message-digest');
var mac = require('./cryptolib-mac');
exports.cryptolib = {
    cipher: cipher,
    padding: padding,
    error: error,
    util: util,
    pin: pin,
    banking: banking,
    random: random,
    messageDigest: messageDigest,
    mac: mac
};

},{"./cryptolib-banking":2,"./cryptolib-cipher":3,"./cryptolib-error":4,"./cryptolib-mac":5,"./cryptolib-message-digest":6,"./cryptolib-padding":8,"./cryptolib-pin":9,"./cryptolib-random":10,"./cryptolib-util":11}],8:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib-nodejs.ts"/>
var error = require('./cryptolib-error');
var random = require('./cryptolib-random');
function extendBuffer(data, optionally, blockSize, filler) {
    if (data.length === 0) {
        error.raiseInvalidArg('Cannot pad data of 0 length');
    }
    var remainingSize = blockSize - (data.length % blockSize);
    if (optionally && (remainingSize % blockSize == 0)) {
        return data;
    }
    var paddedData = new Buffer(data.length + remainingSize);
    data.copy(paddedData, 0, 0, data.length);
    var paddingBuffer = new Buffer(remainingSize);
    filler(paddingBuffer);
    paddingBuffer.copy(paddedData, data.length, 0, paddingBuffer.length);
    return paddedData;
}
var NoPadding = (function () {
    function NoPadding() {
        this.name = "NO_PADDING";
    }
    NoPadding.prototype.pad = function (data, blockSize, optionally) {
        return data;
    };
    NoPadding.prototype.unpad = function (data) {
        return data;
    };
    return NoPadding;
})();
var ZeroPadding = (function () {
    function ZeroPadding() {
        this.name = "ZERO_PADDING";
    }
    ZeroPadding.prototype.pad = function (data, blockSize, optionally) {
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.fill(0, 0, bufferToFill.length);
        });
    };
    ZeroPadding.prototype.unpad = function (data) {
        for (var i = 1; i <= data.length; i++) {
            var byte = data[data.length - i];
            if (byte !== 0x00) {
                return data.slice(0, data.length - i + 1);
            }
        }
        return new Buffer(0);
    };
    return ZeroPadding;
})();
var Iso10126 = (function () {
    function Iso10126() {
        this.name = "ISO_10126";
    }
    Iso10126.prototype.pad = function (data, blockSize, optionally) {
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
        }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            var randomData = random.generate(bufferToFill.length - 1);
            for (var i = 0; i < randomData.length; i++) {
                bufferToFill[i] = randomData[i];
            }
            bufferToFill[bufferToFill.length - 1] = bufferToFill.length;
        });
    };
    Iso10126.prototype.unpad = function (data) {
        var padLength = data[data.length - 1];
        if (padLength < 1 || padLength > data.length) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        return data.slice(0, data.length - padLength);
    };
    return Iso10126;
})();
var AnsiX923 = (function () {
    function AnsiX923() {
        this.name = "ANSI_X.923";
    }
    AnsiX923.prototype.pad = function (data, blockSize, optionally) {
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
        }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.fill(0, 0, bufferToFill.length);
            bufferToFill[bufferToFill.length - 1] = bufferToFill.length;
        });
    };
    AnsiX923.prototype.unpad = function (data) {
        var padLength = data[data.length - 1];
        if (padLength < 1 || padLength > data.length - 1) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        for (var i = 1; i < padLength; i++) {
            var byte = data[data.length - 1 - i];
            if (byte !== 0) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
        }
        return data.slice(0, data.length - padLength);
    };
    return AnsiX923;
})();
var Iso78164Padding = (function () {
    function Iso78164Padding() {
        this.name = "ISO_7816_4";
    }
    Iso78164Padding.prototype.pad = function (data, blockSize, optionally) {
        if (optionally === void 0) { optionally = false; }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.write("80", 0, 1, "hex");
            bufferToFill.fill(0, 1, bufferToFill.length);
        });
    };
    Iso78164Padding.prototype.unpad = function (data) {
        for (var i = 1; i <= data.length; i++) {
            var byte = data[data.length - i];
            if (byte === 0x80) {
                return data.slice(0, data.length - i);
            }
            else if (byte !== 0) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
        }
        throw new error.CryptoError(error.INVALID_PADDING);
    };
    return Iso78164Padding;
})();
var PKCS7Padding = (function () {
    function PKCS7Padding() {
        this.name = "PKCS7";
    }
    PKCS7Padding.prototype.pad = function (data, blockSize, optionally) {
        if (optionally === void 0) { optionally = false; }
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
        }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.fill(bufferToFill.length, 0, bufferToFill.length);
        });
    };
    PKCS7Padding.prototype.unpad = function (data) {
        var nextExpected = data[data.length - 1];
        if (nextExpected > 255 || nextExpected < 1) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        for (var i = 1; i <= 255 && i <= data.length; i++) {
            var byte = data[data.length - i];
            if (byte === nextExpected && i === nextExpected) {
                return data.slice(0, data.length - i);
            }
            else if (byte !== nextExpected) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
        }
    };
    return PKCS7Padding;
})();
var padding = {
    noPadding: new NoPadding(),
    pkcs7: new PKCS7Padding(),
    iso78164: new Iso78164Padding(),
    zeroPadding: new ZeroPadding(),
    iso10126: new Iso10126(),
    ansiX923: new AnsiX923()
};
module.exports = padding;

}).call(this,require("buffer").Buffer)
},{"./cryptolib-error":4,"./cryptolib-random":10,"buffer":13}],9:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var error = require('./cryptolib-error');
var util = require('./cryptolib-util');
var random = require('./cryptolib-random');
var isoPinType = {
    format0: { name: 'ISO_9564_Format_0', value: 0 },
    format1: { name: 'ISO_9564_Format_1', value: 1 },
    format2: { name: 'ISO_9564_Format_2', value: 2 },
    format3: { name: 'ISO_9564_Format_3', value: 3 },
    getAll: function () { return [isoPinType.format0, isoPinType.format1, isoPinType.format2, isoPinType.format3]; }
};
function generateIsoPinRandomPadding(length) {
    var result = '';
    var buffer = random.generate(length);
    for (var i = 0; i < length; i++) {
        result += ((buffer[i] % 6) + 10).toString(16);
    }
    return result;
}
var IsoPin = (function () {
    function IsoPin(aType, aPin, someAdditionalData) {
        if (aPin.length < 1 || aPin.length > 14) {
            error.raiseInvalidArg("Unsupported pin length of " + aPin.length);
        }
        var paddingLength = 14 - aPin.length;
        if (aType === isoPinType.format0 || aType === isoPinType.format3) {
            if (!someAdditionalData || someAdditionalData.length != 12) {
                error.raiseInvalidArg("Pan is missing or not of 12 chars length,  it shall be provided for type " + aType);
            }
        }
        else if (aType === isoPinType.format1) {
            if (!someAdditionalData) {
                someAdditionalData = util.generateRandomNumberString(paddingLength);
            }
            if (someAdditionalData.length < paddingLength) {
                error.raiseInvalidArg("Not enough additional data (pan or transaction id) for pin type" + aType);
            }
            if (someAdditionalData.length > paddingLength) {
                someAdditionalData = someAdditionalData.substring(0, paddingLength);
            }
        }
        else {
            if (someAdditionalData) {
                error.raiseInvalidArg("Unexpected additional data for pin type" + aType);
            }
        }
        this.type = aType;
        this.pin = aPin;
        this.additionalData = someAdditionalData;
    }
    IsoPin.prototype.toBlock = function () {
        var tl = this.type.value.toString() + this.pin.length.toString(16);
        if (this.type.value === 1) {
            return new Buffer(tl + this.pin + this.additionalData, 'hex');
        }
        else if (this.type.value === 2) {
            var paddedPin = tl + this.pin;
            paddedPin = util.rightPad(paddedPin, 16, 'F');
            return new Buffer(paddedPin, 'hex');
        }
        else if (this.type.value === 0 || this.type.value === 3) {
            var paddedPin = tl + this.pin;
            var paddingLength = 14 - this.pin.length;
            if (this.type.value === 3) {
                paddedPin += generateIsoPinRandomPadding(paddingLength);
            }
            else {
                paddedPin = util.rightPad(paddedPin, 16, 'F');
            }
            var paddedPan = '0000' + this.additionalData;
            return util.xor(new Buffer(paddedPin, 'hex'), new Buffer(paddedPan, 'hex'));
        }
        error.raiseInvalidArg('unsupport pin type with value ' + this.type.value);
    };
    IsoPin.parseIsoPinBlock = function (block, pan) {
        if (block.length !== 8) {
            error.raiseInvalidArg('Invalid pin block size, must be 8 bytes');
        }
        var blockHex = block.toString('hex');
        var type = null;
        var allPinTypes = isoPinType.getAll();
        for (var idx = 0; idx < allPinTypes.length; idx++) {
            if (allPinTypes[idx].value.toString() === blockHex.substring(0, 1)) {
                type = allPinTypes[idx];
                break;
            }
        }
        if (!type) {
            error.raiseInvalidArg('Unsupported type ' + blockHex.substring(0, 1));
        }
        var pinLength = 0;
        try {
            pinLength = parseInt(blockHex.substring(1, 2), 16);
        }
        catch (e) {
            error.raiseInvalidArg('Invalid pin length');
        }
        if (type.value === 0 || type.value === 3) {
            if (!pan) {
                var e = new error.CryptoError(error.PAN_MISSING, 'Pan is missing');
                e.additionalInfo = { pinLength: pinLength, pinType: type };
                throw e;
            }
            var paddedPan = '0000' + pan;
            var xoredPin = util.xor(block, new Buffer(paddedPan, 'hex'));
            return new IsoPin(type, xoredPin.toString('hex').substring(2, 2 + pinLength), pan);
        }
        else {
            return new IsoPin(type, block.toString('hex').substring(2, 2 + pinLength));
        }
    };
    return IsoPin;
})();
var pin = {
    createIsoPin: function (isoPinType, pin, additionalData) {
        return new IsoPin(isoPinType, pin, additionalData);
    },
    createIsoPinFromBlock: function (block, pan) {
        return IsoPin.parseIsoPinBlock(block, pan);
    },
    isoPinType: isoPinType
};
module.exports = pin;

}).call(this,require("buffer").Buffer)
},{"./cryptolib-error":4,"./cryptolib-random":10,"./cryptolib-util":11,"buffer":13}],10:[function(require,module,exports){
(function (process,Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
var webCrypto = typeof window !== 'undefined' && (window.crypto || window.msCrypto);
function generate(length) {
    if (nodejs) {
        return require('crypto').randomBytes(length);
    }
    else if (webCrypto) {
        var res = new Uint8Array(length);
        webCrypto.getRandomValues(res);
        return new Buffer(res);
    }
}
exports.generate = generate;

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":17,"buffer":13,"crypto":undefined}],11:[function(require,module,exports){
(function (Buffer){
/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>
var random = require('./cryptolib-random');
function generateRandomNumberString(length) {
    var buffer = random.generate(length);
    var aNum = '';
    for (var i = 0; i < length; i++) {
        aNum += (buffer[i] % 10).toString();
    }
    return aNum;
}
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
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
function values(obj) {
    var vals = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
}
var util = {
    values: values,
    takeLast: takeLast,
    leftPad: leftPad,
    rightPad: rightPad,
    generateRandomNumberString: generateRandomNumberString,
    toArrayBuffer: toArrayBuffer,
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

}).call(this,require("buffer").Buffer)
},{"./cryptolib-random":10,"buffer":13}],12:[function(require,module,exports){
(function (process){
/// <reference path="../d.ts/node/node.d.ts"/>
/// <reference path="./cryptolib.d.ts"/>
var util = require('./cryptolib-util');
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
if (nodejs) {
    exports.forge = require('node-forge');
}
else {
    exports.forge = window.forge;
}
function bufferToString(buffer) {
    var res = '';
    for (var idx = 0; idx < buffer.length; idx++) {
        res += String.fromCharCode(buffer[idx]);
    }
    return res;
}
exports.bufferToString = bufferToString;
function toForgeBuffer(buffer) {
    return exports.forge.util.createBuffer(util.toArrayBuffer(buffer));
}
exports.toForgeBuffer = toForgeBuffer;

}).call(this,require('_process'))
},{"./cryptolib-util":11,"_process":17,"node-forge":undefined}],13:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":14,"ieee754":15,"is-array":16}],14:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],15:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],16:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],17:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[7])(7)
});