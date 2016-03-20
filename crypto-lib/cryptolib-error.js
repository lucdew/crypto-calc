"use strict";
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
}(Error));
var INVALID_ARGUMENT = {
    value: 0,
    name: 'INVALID_ARGUMENT',
    description: 'Invalid argument'
};
var INVALID_PADDING = {
    value: 1,
    name: 'INVALID_PADDING',
    description: 'Invalid padding'
};
var INVALID_BLOCK_SIZE = {
    value: 2,
    name: 'INVALID_BLOCK_SIZE',
    description: 'Invalid block size'
};
var INVALID_KEY_SIZE = {
    value: 3,
    name: 'INVALID_KEY_SIZE',
    description: 'Invalid key size'
};
var PAN_MISSING = {
    value: 4,
    name: 'PAN_MISSING',
    description: 'Pan is missing'
};
var AUTHENTICATED_TAG_INVALID = {
    value: 5,
    name: 'AUTHENTICATED_TAG_INVALID',
    description: 'Authenticated tag is invalid'
};
function raiseInvalidArg(msg) {
    throw new CryptoError(INVALID_ARGUMENT, msg);
}
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
//# sourceMappingURL=cryptolib-error.js.map