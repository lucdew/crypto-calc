
export namespace error {

    declare class Error {
        public name: string;
        public message: string;
        public stack: string;
        constructor(message?: string);
    }

    export interface IErrorCode {
        name: string;
        value: number;
        description?: string;
    }

    export class CryptoError extends Error {

        public code: IErrorCode;
        public name: string;
        public message: string;
        public additionalInfo: any;

        constructor(code: IErrorCode, message?: string) {
            super(message || code.description || code.name);
            this.message = message || code.description || code.name;
            this.code = code;
            this.name = "CryptoError";
            let curStack = ( < any > new Error()).stack;

            if (curStack) { // Phantomjs error do not have stack... 
                // remove one line of stack    
                this.stack = curStack.replace(/\n[^\n]*/, "");
            }
        }

        public getCode(): IErrorCode {
            return this.code;
        }
        public toString() {
            return this.name + ": " + this.message;
        }

    }

    export const INVALID_ARGUMENT: IErrorCode = {
        value: 0,
        name: "INVALID_ARGUMENT",
        description: "Invalid argument"
    };

    export const INVALID_PADDING: IErrorCode = {
        value: 1,
        name: "INVALID_PADDING",
        description: "Invalid padding"
    };

    export const INVALID_BLOCK_SIZE: IErrorCode = {
        value: 2,
        name: "INVALID_BLOCK_SIZE",
        description: "Invalid block size"
    };

    export const INVALID_KEY_SIZE: IErrorCode = {
        value: 3,
        name: "INVALID_KEY_SIZE",
        description: "Invalid key size"
    };

    export const PAN_MISSING: IErrorCode = {
        value: 4,
        name: "PAN_MISSING",
        description: "Pan is missing"
    };

    export const AUTHENTICATED_TAG_INVALID: IErrorCode = {
        value: 5,
        name: "AUTHENTICATED_TAG_INVALID",
        description: "Authenticated tag is invalid"
    };

    export function raiseInvalidArg(msg: string) {
        throw new CryptoError(INVALID_ARGUMENT, msg);
    }

}


// export interface CryptoErrorStatic {
//     new(code: IErrorCode, message ? : string): CryptoError;
// }
