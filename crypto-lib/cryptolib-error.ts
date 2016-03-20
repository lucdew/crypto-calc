/// <reference path='./cryptolib.d.ts'/>

declare class Error {
    public name: string;
    public message: string;
    public stack: string;
    constructor(message ? : string);
}

class CryptoError extends Error {

    code: Cryptolib.Error.IErrorCode;
    name: string;
    message: string;
    additionalInfo: any;

    constructor(code: Cryptolib.Error.IErrorCode, message ? : string) {
        super(message || code.description || code.name);
        this.message = message || code.description || code.name;
        this.code = code;
        this.name = 'CryptoError';
        var stack = ( < any > new Error()).stack;
        // remove one line of stack
        this.stack = stack.replace(/\n[^\n]*/, '');
    }

    getCode(): Cryptolib.Error.IErrorCode {
        return this.code;
    }
    toString() {
        return this.name + ': ' + this.message;
    }

}

const INVALID_ARGUMENT: Cryptolib.Error.IErrorCode = {
    value: 0,
    name: 'INVALID_ARGUMENT',
    description: 'Invalid argument'
};

const INVALID_PADDING: Cryptolib.Error.IErrorCode = {
    value: 1,
    name: 'INVALID_PADDING',
    description: 'Invalid padding'
};

const INVALID_BLOCK_SIZE: Cryptolib.Error.IErrorCode = {
    value: 2,
    name: 'INVALID_BLOCK_SIZE',
    description: 'Invalid block size'
};

const INVALID_KEY_SIZE: Cryptolib.Error.IErrorCode = {
    value: 3,
    name: 'INVALID_KEY_SIZE',
    description: 'Invalid key size'
};

const PAN_MISSING: Cryptolib.Error.IErrorCode = {
    value: 4,
    name: 'PAN_MISSING',
    description: 'Pan is missing'
};

const AUTHENTICATED_TAG_INVALID: Cryptolib.Error.IErrorCode = {
    value: 5,
    name: 'AUTHENTICATED_TAG_INVALID',
    description: 'Authenticated tag is invalid'
};

function raiseInvalidArg(msg: string) {
    throw new CryptoError(INVALID_ARGUMENT, msg);
}

const error = {
    CryptoError: CryptoError,
    INVALID_ARGUMENT: INVALID_ARGUMENT,
    INVALID_PADDING: INVALID_PADDING,
    INVALID_BLOCK_SIZE: INVALID_BLOCK_SIZE,
    INVALID_KEY_SIZE: INVALID_KEY_SIZE,
    PAN_MISSING: PAN_MISSING,
    AUTHENTICATED_TAG_INVALID: AUTHENTICATED_TAG_INVALID,
    raiseInvalidArg: raiseInvalidArg
};

export = error;