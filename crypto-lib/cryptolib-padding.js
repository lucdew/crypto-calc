"use strict";
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
        this.name = 'NO_PADDING';
    }
    NoPadding.prototype.pad = function (data, blockSize, optionally) {
        return data;
    };
    NoPadding.prototype.unpad = function (data) {
        return data;
    };
    return NoPadding;
}());
var ZeroPadding = (function () {
    function ZeroPadding() {
        this.name = 'ZERO_PADDING';
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
}());
var Iso10126 = (function () {
    function Iso10126() {
        this.name = 'ISO_10126';
    }
    Iso10126.prototype.pad = function (data, blockSize, optionally) {
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, 'Cannot pad block size of ' + blockSize);
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
}());
var AnsiX923 = (function () {
    function AnsiX923() {
        this.name = 'ANSI_X.923';
    }
    AnsiX923.prototype.pad = function (data, blockSize, optionally) {
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, 'Cannot pad block size of ' + blockSize);
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
}());
var Iso78164Padding = (function () {
    function Iso78164Padding() {
        this.name = 'ISO_7816_4';
    }
    Iso78164Padding.prototype.pad = function (data, blockSize, optionally) {
        if (optionally === void 0) { optionally = false; }
        return extendBuffer(data, optionally, blockSize, function (bufferToFill) {
            bufferToFill.write('80', 0, 1, 'hex');
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
}());
var PKCS7Padding = (function () {
    function PKCS7Padding() {
        this.name = 'PKCS7';
    }
    PKCS7Padding.prototype.pad = function (data, blockSize, optionally) {
        if (optionally === void 0) { optionally = false; }
        if (blockSize > 255 || blockSize < 1) {
            throw new error.CryptoError(error.INVALID_BLOCK_SIZE, 'Cannot pad block size of ' + blockSize);
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
}());
var padding = {
    noPadding: new NoPadding(),
    pkcs7: new PKCS7Padding(),
    iso78164: new Iso78164Padding(),
    zeroPadding: new ZeroPadding(),
    iso10126: new Iso10126(),
    ansiX923: new AnsiX923()
};
module.exports = padding;
//# sourceMappingURL=cryptolib-padding.js.map