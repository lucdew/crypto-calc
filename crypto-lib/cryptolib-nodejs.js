var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var nodecrypto = require('crypto');
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
exports.INVALID_ARGUMENT = {
    value: 0,
    name: "INVALID_ARGUMENT",
    description: "Invalid argument"
};
exports.INVALID_PADDING = {
    value: 1,
    name: "INVALID_PADDING",
    description: "Invalid padding"
};
var INVALID_BLOCK_SIZE = {
    value: 2,
    name: "INVALID_BLOCK_SIZE",
    description: "Invalid block size"
};
var INVALID_KEY_SIZE = {
    value: 3,
    name: "INVALID_KEY_SIZE",
    description: "Invalid key size"
};
var PAN_MISSING = {
    value: 4,
    name: "PAN_MISSING",
    description: "Pan is missing"
};
function raiseInvalidArg(msg) {
    throw new CryptoError(exports.INVALID_ARGUMENT, msg);
}
function extendBuffer(data, optionally, blockSize, filler) {
    if (data.length === 0) {
        raiseInvalidArg('Cannot pad data of 0 length');
    }
    var remainingSize = blockSize - (data.length % blockSize);
    if (optionally && (remainingSize % blockSize == 0)) {
        return data;
    }
    var paddedData = new Buffer(data.length + remainingSize);
    data.copy(paddedData, 0, 0, paddedData.length);
    var paddingBuffer = new Buffer(remainingSize);
    filler(paddingBuffer);
    paddingBuffer.copy(paddedData, data.length, 0, paddingBuffer.length);
    return paddedData;
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
var util = {
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
                throw new CryptoError(exports.INVALID_PADDING);
            }
        }
        throw new CryptoError(exports.INVALID_PADDING);
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
            throw new CryptoError(INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
        }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.fill(bufferToFill.length, 0, bufferToFill.length);
        });
    };
    PKCS7Padding.prototype.unpad = function (data) {
        var nextExpected = data[data.length - 1];
        if (nextExpected > 255 || nextExpected < 1) {
            throw new CryptoError(exports.INVALID_PADDING);
        }
        for (var i = 1; i <= 255 && i <= data.length; i++) {
            var byte = data[data.length - i];
            if (byte === nextExpected && i === nextExpected) {
                return data.slice(0, data.length - i);
            }
            else if (byte !== nextExpected) {
                throw new CryptoError(exports.INVALID_PADDING);
            }
        }
    };
    return PKCS7Padding;
})();
var padding = {
    noPadding: new NoPadding(),
    pkcs7: new PKCS7Padding(),
    iso78164: new Iso78164Padding(),
    getAll: function () {
        return [padding.noPadding, padding.iso78164, padding.pkcs7];
    }
};
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
    desede: { blockSize: 8, name: '3DES', cryptoName: 'des-ede', keyLengths: [128, 192] },
    getAll: function () {
        return [cipherAlgo.aes, cipherAlgo.des, cipherAlgo.desede];
    }
};
var isoPinType = {
    format0: { name: 'ISO_9564_Format_0', value: 0 },
    format1: { name: 'ISO_9564_Format_1', value: 1 },
    format2: { name: 'ISO_9564_Format_2', value: 2 },
    format3: { name: 'ISO_9564_Format_3', value: 3 },
    getAll: function () {
        return [isoPinType.format0, isoPinType.format1, isoPinType.format2, isoPinType.format3];
    }
};
function generateRandomNumberString(length) {
    var buffer = nodecrypto.randomBytes(length);
    var aNum = '';
    for (var i = 0; i < length; i++) {
        aNum += (buffer[i] % 10).toString();
    }
    return aNum;
}
function generateIsoPinRandomPadding(length) {
    var result = '';
    var buffer = nodecrypto.randomBytes(length);
    for (var i = 0; i < length; i++) {
        result += ((buffer[i] % 6) + 10).toString(16);
    }
    return result;
}
function rightPad(aString, length, padChar) {
    var result = aString;
    while (result.length < length) {
        result += padChar;
    }
    return result;
}
var IsoPin = (function () {
    function IsoPin(aType, aPin, someAdditionalData) {
        if (aPin.length < 1 || aPin.length > 14) {
            raiseInvalidArg("Unsupported pin length of " + aPin.length);
        }
        var paddingLength = 14 - aPin.length;
        if (aType === isoPinType.format0 || aType === isoPinType.format3) {
            if (!someAdditionalData || someAdditionalData.length != 12) {
                raiseInvalidArg("Pan is missing or not of 12 chars length,  it shall be provided for type " + aType);
            }
        }
        else if (aType === isoPinType.format1) {
            if (!someAdditionalData) {
                someAdditionalData = generateRandomNumberString(paddingLength);
            }
            if (someAdditionalData.length < paddingLength) {
                raiseInvalidArg("Not enough additional data (pan or transaction id) for pin type" + aType);
            }
            if (someAdditionalData.length > paddingLength) {
                someAdditionalData = someAdditionalData.substring(0, paddingLength);
            }
        }
        else {
            if (someAdditionalData) {
                raiseInvalidArg("Unexpected additional data for pin type" + aType);
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
            paddedPin = rightPad(paddedPin, 16, 'F');
            return new Buffer(paddedPin, 'hex');
        }
        else if (this.type.value === 0 || this.type.value === 3) {
            var paddedPin = tl + this.pin;
            var paddingLength = 14 - this.pin.length;
            if (this.type.value === 3) {
                paddedPin += generateIsoPinRandomPadding(paddingLength);
            }
            else {
                paddedPin = rightPad(paddedPin, 16, 'F');
            }
            var paddedPan = '0000' + this.additionalData;
            return util.xor(new Buffer(paddedPin, 'hex'), new Buffer(paddedPan, 'hex'));
        }
        raiseInvalidArg('unsupport pin type with value ' + this.type.value);
    };
    IsoPin.parseIsoPinBlock = function (block, pan) {
        if (block.length !== 8) {
            raiseInvalidArg('Invalid pin block size, must be 8 bytes');
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
            raiseInvalidArg('Unsupported type ' + blockHex.substring(0, 1));
        }
        var pinLength = 0;
        try {
            pinLength = parseInt(blockHex.substring(1, 2), 16);
        }
        catch (e) {
            raiseInvalidArg('Invalid pin length');
        }
        if (type.value === 0 || type.value === 3) {
            if (!pan) {
                var e = new CryptoError(PAN_MISSING, 'Pan is missing');
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
        var last13Digits = takeLast(this.rawValue, 13);
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
            raiseInvalidArg('PAN is not issued');
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
var Cipher = (function () {
    function Cipher(aCipherAlgo, aBlockCipherMode, aPadding) {
        this.dataCount = 0;
        this.cipherAlgo = aCipherAlgo;
        this.blockCipherMode = aBlockCipherMode;
        this.padding = aPadding;
    }
    Cipher.prototype.init = function (key, cipherMode, iv) {
        this.cipherMode = cipherMode;
        if (!iv) {
            iv = this.genNullIv(this.blockCipherMode.hasIV ? this.cipherAlgo.blockSize : 0);
        }
        if (cipherMode) {
            this.cipher = nodecrypto.createCipheriv(this.getSymCryptoAlgorithm(key), key, iv);
        }
        else {
            this.cipher = nodecrypto.createDecipheriv(this.getSymCryptoAlgorithm(key), key, iv);
        }
        this.cipher.setAutoPadding(false);
    };
    Cipher.prototype.genNullIv = function (length) {
        var iv = new Buffer(length);
        iv.fill(0);
        return iv;
    };
    Cipher.prototype.update = function (data) {
        this.dataCount += data.length;
        return this.cipher.update(data);
    };
    Cipher.prototype.finish = function (data) {
        if (this.cipherMode) {
            var dataToProcess;
            if (data) {
                dataToProcess = this.padding.pad(data, this.cipherAlgo.blockSize);
            }
            else {
                var toPadSize = this.cipherAlgo.blockSize - (this.dataCount % this.cipherAlgo.blockSize);
                dataToProcess = this.padding.pad(new Buffer(""), this.cipherAlgo.blockSize);
            }
            return Buffer.concat([this.cipher.update(dataToProcess), this.cipher.final()]);
        }
        else {
            if (data) {
                var paddedData = this.cipher.update(data);
                return this.padding.unpad(paddedData);
            }
            else {
                return this.cipher.final();
            }
        }
    };
    Cipher.prototype.getSymCryptoAlgorithm = function (key) {
        var algo = this.cipherAlgo.cryptoName;
        if (this.cipherAlgo === cipherAlgo.desede && key.length === 192) {
            algo += '3';
        }
        else if (this.cipherAlgo === cipherAlgo.aes) {
            algo += '-' + key.length * 8;
        }
        if (this.blockCipherMode === blockCipherMode.ecb && this.cipherAlgo !== cipherAlgo.aes) {
            return algo;
        }
        algo += '-';
        algo += this.blockCipherMode.cryptoName;
        return algo;
    };
    return Cipher;
})();
function computeKcv(key, cipherAlgo, length) {
    if (length && length > cipherAlgo.blockSize) {
        raiseInvalidArg("Invalid KCV length " + length + " must be lower or equal than " + cipherAlgo.blockSize);
    }
    var data = new Buffer(cipherAlgo.blockSize);
    data.fill(0);
    var cipher = new Cipher(cipherAlgo, blockCipherMode.ecb, padding.noPadding);
    cipher.init(key, true);
    var result = util.toHex(cipher.finish(data));
    return length ? result.substr(0, length * 2) : result;
}
var cipher = {
    cipherAlgo: cipherAlgo,
    blockCipherMode: blockCipherMode,
    createCipher: function (cipherAlgo, blockCipherMode, padding) {
        return new Cipher(cipherAlgo, blockCipherMode, padding);
    },
    computeKcv: computeKcv
};
exports.cryptolib = {
    cipher: cipher,
    padding: padding,
    error: {
        CryptoError: CryptoError,
        INVALID_ARGUMENT: exports.INVALID_ARGUMENT,
        INVALID_PADDING: exports.INVALID_PADDING,
        INVALID_BLOCK_SIZE: INVALID_BLOCK_SIZE,
        INVALID_KEY_SIZE: INVALID_KEY_SIZE,
        PAN_MISSING: PAN_MISSING
    },
    util: util,
    pin: pin,
    banking: banking
};
//# sourceMappingURL=cryptolib-nodejs.js.map