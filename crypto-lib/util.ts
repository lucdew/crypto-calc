import {random} from "./random";

export namespace util {
   export function generateRandomNumberString(length: number) {
        let buffer = random.generate(length);
        let aNum = "";
        for (let i = 0; i < length; i++) {
            aNum += (buffer[i] % 10).toString();
        }
        return aNum;
    }

    export function toArrayBuffer(buffer: Buffer) {
        let ab = new ArrayBuffer(buffer.length);
        let view = new Uint8Array(ab);
        for (let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    }

    export function bitwiseBuffers(a: Buffer, b: Buffer, bitwiseOperation: (aNum: number, bNum: number) => number) {
        let res: number[] = [];
        if (a.length > b.length) {
            for (let i = 0; i < b.length; i++) {
                res.push(bitwiseOperation(a[i], b[i]));
            }
        } else {
            for (let i = 0; i < a.length; i++) {
                res.push(bitwiseOperation(a[i], b[i]));
            }
        }
        return new Buffer(res);
    }

    export function rightPad(aString: string, length: number, padChar: string) {
        let result = aString;
        while (result.length < length) {
            result += padChar;
        }
        return result;
    }


    export function leftPad(aString: string, n: number, padChar: string): string {
        if (aString.length >= n) {
            return aString;
        } else {
            let paddedString = aString;
            while (paddedString.length !== n) {
                paddedString = padChar + paddedString;
            }
        }
    }

    export function takeLast(aString: string, n: number) {
        if (aString.length > n) {
            return aString.substring(aString.length - n);
        } else {
            if (aString.length < n) {
                return leftPad(aString, n, "0");
            } else {
                return aString;
            }
        }
    }

    export function values(obj: any) {
        let vals: any[] = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                vals.push(obj[key]);
            }
        }
        return vals;
    }

    export function createBuffer(data: string, encoding: string): Buffer {
        return new Buffer(data, encoding);
    };

    export function toHex(data: Buffer): string {
        return data.toString("hex").toUpperCase();
    };

    export function fromHex(data: string): Buffer {
        return new Buffer(data, "hex");
    };

    export function xor(a: Buffer, b: Buffer): Buffer {
        return bitwiseBuffers(a, b, (aNum, bNum) => aNum ^ bNum);
    };
    export function and(a: Buffer, b: Buffer): Buffer {
        return bitwiseBuffers(a, b, (aNum, bNum) => aNum & bNum);
    };

    export function or(a: Buffer, b: Buffer): Buffer {
        return bitwiseBuffers(a, b, (aNum, bNum) => aNum | bNum);
    };

    export function not(a: Buffer): Buffer {
        let res: number[] = [];
        for (let i = 0; i < a.length; i++) {
            res.push(~a[i]);
        }
        return new Buffer(res);
    }

}
