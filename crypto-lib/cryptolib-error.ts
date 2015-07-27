/// <reference path="./cryptolib.d.ts"/>

declare class Error {
    public name: string;
    public message: string;
    public stack: string;
    constructor(message?: string);
}
	
 class CryptoError extends Error {     

    code : Cryptolib.Error.IErrorCode;     
    name : string;       
    message : string;
    additionalInfo: any;

    constructor(code:  Cryptolib.Error.IErrorCode, message? : string) {
        super(message||code.description||code.name);
        this.message = message||code.description||code.name;
        this.code = code;  
        this.name = 'CryptoError'; 
        var stack = (<any>new Error()).stack; 
        // remove one line of stack
        this.stack = stack.replace(/\n[^\n]*/,'');
    } 

    getCode(): Cryptolib.Error.IErrorCode {  
        return this.code; 
    } 
    toString() {
        return this.name + ': ' + this.message;
    }

} 

function raiseInvalidArg(msg:string) {
  throw new CryptoError(INVALID_ARGUMENT,msg);
}
	
var INVALID_ARGUMENT:Cryptolib.Error.IErrorCode = {
    value : 0, 
    name:"INVALID_ARGUMENT",
    description:"Invalid argument"};

var INVALID_PADDING:Cryptolib.Error.IErrorCode = {
    value : 1, 
    name:"INVALID_PADDING",
    description:"Invalid padding"};

var INVALID_BLOCK_SIZE:Cryptolib.Error.IErrorCode = {
    value : 2, 
    name:"INVALID_BLOCK_SIZE",
    description:"Invalid block size"};
    
var INVALID_KEY_SIZE:Cryptolib.Error.IErrorCode = {
    value : 3, 
    name:"INVALID_KEY_SIZE",
    description:"Invalid key size"};
    
 var PAN_MISSING:Cryptolib.Error.IErrorCode = {
    value : 4, 
    name:"PAN_MISSING",
    description:"Pan is missing"};
    
var error = {
        CryptoError: CryptoError,
        INVALID_ARGUMENT:INVALID_ARGUMENT,
		INVALID_PADDING:INVALID_PADDING ,
        INVALID_BLOCK_SIZE:INVALID_BLOCK_SIZE,
        INVALID_KEY_SIZE:INVALID_KEY_SIZE,
        PAN_MISSING:PAN_MISSING,
        raiseInvalidArg : raiseInvalidArg   
};

export = error;
