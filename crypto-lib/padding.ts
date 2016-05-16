import {error} from "./error";
import {random} from "./random";

export namespace padding {

    export interface IPaddingStatic {
        [index: string]: IPadding;
        noPadding: IPadding;
        iso78164: IPadding;
        pkcs7: IPadding;
        iso10126: IPadding;
        zeroPadding: IPadding;
        ansiX923: IPadding;
    }

    export interface IPadding {
        name: string;
        pad(data: Buffer, blockSize: number, optionally?: boolean): Buffer;
        unpad(data: Buffer): Buffer;
    }

    function extendBuffer(data: Buffer, optionally: boolean, blockSize: number, filler: (bufferToFill: Buffer) => void) {

        if (data.length === 0) {
            error.raiseInvalidArg("Cannot pad data of 0 length");
        }
        let remainingSize = blockSize - (data.length % blockSize);

        if (optionally && (remainingSize % blockSize === 0)) {
            return data;
        }
        let paddedData = new Buffer(data.length + remainingSize);
        data.copy(paddedData, 0, 0, data.length);
        let paddingBuffer = new Buffer(remainingSize);
        filler(paddingBuffer);
        paddingBuffer.copy(paddedData, data.length, 0, paddingBuffer.length);
        return paddedData;

    }

    class NoPadding implements IPadding {

        public name: string = "NO_PADDING";

        public pad(data: Buffer, blockSize: number, optionally?: boolean) {
            return data;
        }
        public unpad(data: Buffer) {
            return data;
        }

    }


    class ZeroPadding implements IPadding {

        public name: string = "ZERO_PADDING";

        public pad(data: Buffer, blockSize: number, optionally?: boolean) {
            return extendBuffer(data, optionally, blockSize, (bufferToFill: Buffer) => {
                bufferToFill.fill(0, 0, bufferToFill.length);
            });
        }

        public unpad(data: Buffer) {
            for (let i = 1; i <= data.length; i++) {

                let byte = data[data.length - i];
                if (byte !== 0x00) {
                    return data.slice(0, data.length - i + 1);
                }
            }
            return new Buffer(0);
        }

    }


    class Iso10126 implements IPadding {

        public name: string = "ISO_10126";

        public pad(data: Buffer, blockSize: number, optionally?: boolean) {
            if (blockSize > 255 || blockSize < 1) {
                throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
            }
            return extendBuffer(data, optionally, blockSize, (bufferToFill: Buffer) => {
                let randomData = random.generate(bufferToFill.length - 1);
                for (let i = 0; i < randomData.length; i++) {
                    bufferToFill[i] = randomData[i];
                }
                bufferToFill[bufferToFill.length - 1] = bufferToFill.length;
            });

        }
        public unpad(data: Buffer) {
            let padLength = data[data.length - 1];
            if (padLength < 1 || padLength > data.length) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
            return data.slice(0, data.length - padLength);
        }

    }


    class AnsiX923 implements IPadding {

        public name: string = "ANSI_X.923";

        public pad(data: Buffer, blockSize: number, optionally?: boolean) {
            if (blockSize > 255 || blockSize < 1) {
                throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
            }
            return extendBuffer(data, optionally, blockSize, (bufferToFill: Buffer) => {
                bufferToFill.fill(0, 0, bufferToFill.length);
                bufferToFill[bufferToFill.length - 1] = bufferToFill.length;
            });

        }
        public unpad(data: Buffer) {
            let padLength = data[data.length - 1];
            if (padLength < 1 || padLength > data.length - 1) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
            for (let i = 1; i < padLength; i++) {

                let byte = data[data.length - 1 - i];
                if (byte !== 0) {
                    throw new error.CryptoError(error.INVALID_PADDING);
                }

            }
            return data.slice(0, data.length - padLength);
        }

    }

    class Iso78164Padding implements IPadding {

        public name: string = "ISO_7816_4";

        public pad(data: Buffer, blockSize: number, optionally = false): Buffer {
            return extendBuffer(data, optionally, blockSize, (bufferToFill: Buffer) => {
                bufferToFill.write("80", 0, 1, "hex");
                bufferToFill.fill(0, 1, bufferToFill.length);
            });

        }

        public unpad(data: Buffer): Buffer {
            for (let i = 1; i <= data.length; i++) {

                let byte = data[data.length - i];
                if (byte === 0x80) {
                    return data.slice(0, data.length - i);
                } else if (byte !== 0) {
                    throw new error.CryptoError(error.INVALID_PADDING);
                }
            }
            throw new error.CryptoError(error.INVALID_PADDING);
        }

    }

    class PKCS7Padding implements IPadding {

        public name: string = "PKCS7";

        public pad(data: Buffer, blockSize: number, optionally = false): Buffer {
            if (blockSize > 255 || blockSize < 1) {
                throw new error.CryptoError(error.INVALID_BLOCK_SIZE, "Cannot pad block size of " + blockSize);
            }
            return extendBuffer(data, optionally, blockSize, (bufferToFill: Buffer) => {
                bufferToFill.fill(bufferToFill.length, 0, bufferToFill.length);
            });

        }
        public unpad(data: Buffer): Buffer {
            let nextExpected = data[data.length - 1];
            if (nextExpected > 255 || nextExpected < 1) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
            for (let i = 1; i <= 255 && i <= data.length; i++) {

                let byte = data[data.length - i];
                if (byte === nextExpected && i === nextExpected) {
                    return data.slice(0, data.length - i);
                } else if (byte !== nextExpected) {
                    throw new error.CryptoError(error.INVALID_PADDING);
                }
            }

        }

    }


    export let noPadding: IPadding =  new NoPadding();
    export let pkcs7: IPadding =  new PKCS7Padding();
    export let iso78164: IPadding =  new Iso78164Padding();
    export let zeroPadding: IPadding =  new ZeroPadding();
    export let iso10126: IPadding =  new Iso10126();
    export let ansiX923: IPadding =  new AnsiX923();
}
