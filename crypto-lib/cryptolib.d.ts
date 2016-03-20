/// <reference path="./node.d.ts"/>

declare module Cryptolib {

    module Error {
        interface IErrorCode {
            name: string;
            value: number;
            description ? : string;
        }


        export class CryptoError {
            code: IErrorCode;
            name: string;
            message: string;
            additionalInfo: any;
        }

        interface CryptoErrorStatic {
            new(code: Cryptolib.Error.IErrorCode, message ? : string): CryptoError;
        }

        interface ErrorStatic {
            CryptoError: CryptoErrorStatic;
            INVALID_ARGUMENT: IErrorCode;
            INVALID_PADDING: IErrorCode;
            INVALID_BLOCK_SIZE: IErrorCode;
            INVALID_KEY_SIZE: IErrorCode;
            PAN_MISSING: IErrorCode;
            AUTHENTICATED_TAG_INVALID: IErrorCode;
        }
    }


    module Random {
        interface IRandomStatic {
            generate(length: number): Buffer;
        }
    }


    module Util {
        // interface Buffer {
        //     [index: number]: number;
        //     write(string: string, offset ? : number, length ? : number, encoding ? : string): number;
        //     toString(encoding ? : string, start ? : number, end ? : number): string;
        //     toJSON(): any;
        //     length: number;
        //     equals(otherBuffer: Buffer): boolean;
        //     compare(otherBuffer: Buffer): number;
        //     copy(targetBuffer: Buffer, targetStart ? : number, sourceStart ? : number, sourceEnd ? : number): number;
        //     slice(start ? : number, end ? : number): Buffer;
        //     writeUIntLE(value: number, offset: number, byteLength: number, noAssert ? : boolean): number;
        //     writeUIntBE(value: number, offset: number, byteLength: number, noAssert ? : boolean): number;
        //     writeIntLE(value: number, offset: number, byteLength: number, noAssert ? : boolean): number;
        //     writeIntBE(value: number, offset: number, byteLength: number, noAssert ? : boolean): number;
        //     readUIntLE(offset: number, byteLength: number, noAssert ? : boolean): number;
        //     readUIntBE(offset: number, byteLength: number, noAssert ? : boolean): number;
        //     readIntLE(offset: number, byteLength: number, noAssert ? : boolean): number;
        //     readIntBE(offset: number, byteLength: number, noAssert ? : boolean): number;
        //     readUInt8(offset: number, noAsset ? : boolean): number;
        //     readUInt16LE(offset: number, noAssert ? : boolean): number;
        //     readUInt16BE(offset: number, noAssert ? : boolean): number;
        //     readUInt32LE(offset: number, noAssert ? : boolean): number;
        //     readUInt32BE(offset: number, noAssert ? : boolean): number;
        //     readInt8(offset: number, noAssert ? : boolean): number;
        //     readInt16LE(offset: number, noAssert ? : boolean): number;
        //     readInt16BE(offset: number, noAssert ? : boolean): number;
        //     readInt32LE(offset: number, noAssert ? : boolean): number;
        //     readInt32BE(offset: number, noAssert ? : boolean): number;
        //     readFloatLE(offset: number, noAssert ? : boolean): number;
        //     readFloatBE(offset: number, noAssert ? : boolean): number;
        //     readDoubleLE(offset: number, noAssert ? : boolean): number;
        //     readDoubleBE(offset: number, noAssert ? : boolean): number;
        //     writeUInt8(value: number, offset: number, noAssert ? : boolean): void;
        //     writeUInt16LE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeUInt16BE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeUInt32LE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeUInt32BE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeInt8(value: number, offset: number, noAssert ? : boolean): void;
        //     writeInt16LE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeInt16BE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeInt32LE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeInt32BE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeFloatLE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeFloatBE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeDoubleLE(value: number, offset: number, noAssert ? : boolean): void;
        //     writeDoubleBE(value: number, offset: number, noAssert ? : boolean): void;
        //     fill(value: any, offset ? : number, end ? : number): void;
        // }

        interface IUtilStatic {
            values(object: any): any[];
            toArrayBuffer(buffer: Buffer): ArrayBuffer;
            createBuffer(data: string, encoding: string): Buffer;
            leftPad(aString: string, n: number, padChar: string): string;
            rightPad(aString: string, n: number, padChar: string): string;
            takeLast(aString: string, n: number): string;
            generateRandomNumberString(length: number): string;
            fromHex(data: string): Buffer;
            toHex(data: Buffer): string;
            xor(a: Buffer, b: Buffer): Buffer;
            or(a: Buffer, b: Buffer): Buffer;
            and(a: Buffer, b: Buffer): Buffer;
            not(a: Buffer): Buffer;

        }


    }

    module Banking {

        interface IIssuingNetwork {
            name: string;
            iinRegexp: RegExp;
            active: boolean;
            lengths: {
                min: number;
                max: number;
            };
            exclusions ? : [RegExp];
        }

        interface IIssuingNetworkStatic {
            Amex: IIssuingNetwork;
            Bankcard: IIssuingNetwork;
            ChinaUnionPay: IIssuingNetwork;
            DinersClubCarteBlanche: IIssuingNetwork;
            DinersClubEnRoute: IIssuingNetwork;
            DinersClubInternational: IIssuingNetwork;
            // see: https://github.com/PawelDecowski/jquery-creditcardvalidator/issues/2
            //DinersClubUsCanada: IIssuingNetwork;
            DiscoverCard: IIssuingNetwork;
            InterPayment: IIssuingNetwork;
            InstaPayment: IIssuingNetwork;
            JCB: IIssuingNetwork;
            Laser: IIssuingNetwork;
            Maestro: IIssuingNetwork;
            Dankort: IIssuingNetwork;
            MasterCardNotActive: IIssuingNetwork;
            MasterCard: IIssuingNetwork;
            Solo: IIssuingNetwork;
            Switch: IIssuingNetwork;
            Visa: IIssuingNetwork;
            UATP: IIssuingNetwork;
            getAll(): IIssuingNetwork[]

        }

        interface IPan {
            issuerIdentificationNumber: string;
            majorIndustryIdentifer: string;
            individualAccountIdentifier: string;
            isValid(): boolean;
            checkDigit: string;
            issuingNetwork: IIssuingNetwork;
            formatForIso9564Pin(): string;
        }

        interface IBankingStatic {
            createPanFromString(pan: string): IPan;
            computeCheckDigit(pan: string): string;
            issuingNetwork: IIssuingNetworkStatic;
        }

    }





    module Pin {

        interface IIsoPinTypeStatic {
            format0: IIsoPinType;
            format1: IIsoPinType;
            format2: IIsoPinType;
            format3: IIsoPinType;
            getAll(): IIsoPinType[];
        }

        interface IIsoPinType {
            name: string;
            value: number;
        }

        interface IIsoPin {
            type: IIsoPinType;
            pin: string;
            additionalData: string;
            toBlock(): Buffer;
        }

        interface IPinStatic {
            createIsoPin(isoPinType: IIsoPinType, pin: string, additionalData ? : string): IIsoPin;
            createIsoPinFromBlock(block: Buffer, pan ? : string): IIsoPin;
            isoPinType: IIsoPinTypeStatic;
        }
    }


    module Padding {
        interface IPaddingStatic {
            [index: string]: IPadding;
            noPadding: IPadding;
            iso78164: IPadding;
            pkcs7: IPadding;
            iso10126: IPadding;
            zeroPadding: IPadding;
            ansiX923: IPadding;
        }

        interface IPadding {
            name: string;
            pad(data: Buffer, blockSize: number, optionally ? : boolean): Buffer;
            unpad(data: Buffer): Buffer;
        }

    }



    module MessageDigest {

        interface IMessageDigestType {
            name: string;
            digestSize: number;
            blockSize: number;
            security: number;
        }

        interface IMessageDigestTypeStatic {
            MD5: IMessageDigestType;
            SHA1: IMessageDigestType;
            SHA2_224: IMessageDigestType;
            SHA2_256: IMessageDigestType;
            SHA2_384: IMessageDigestType;
            SHA2_512: IMessageDigestType;
            SHA2_512_224: IMessageDigestType;
            SHA2_512_256: IMessageDigestType;
            SHA3_224: IMessageDigestType;
            SHA3_256: IMessageDigestType;
            SHA3_384: IMessageDigestType;
            SHA3_512: IMessageDigestType;
            [index: string]: IMessageDigestType;
        }

        interface IMessageDigestStatic {
            messageDigestType: IMessageDigestTypeStatic;
            digest(messageDigest: IMessageDigestType, data: Buffer): Buffer;
        }

    }

    module Mac {
        interface IMacStatic {
            blockCipherMac(key: Buffer, data: Buffer): Buffer; // CBC-MAC, CMAC, ISO9797 algo 3 retail MAC
            hmac(messageDigest: MessageDigest.IMessageDigestType, key: Buffer, data: Buffer): Buffer;
        }
    }

    module Cipher {


        interface IBlockCipherMode {
            name: string;
            hasIV: boolean;
            cryptoName: string;
            isStreaming: boolean;
            isAuthenticatedEncryption: boolean;
            supportedBlockSizes ? : number[];
        }

        interface ICipherAlgo {
            blockSize: number;
            name: string;
            cryptoName: string;
            keyLengths ? : number[];
            modes: IBlockCipherMode[];
        }

        interface ICipherAlgoStatic {
            aes: ICipherAlgo;
            des: ICipherAlgo;
            desede: ICipherAlgo;
            [index: string]: ICipherAlgo;
        }

        interface IBlockCipherModeStatic {
            cbc: IBlockCipherMode;
            ecb: IBlockCipherMode;
            cfb: IBlockCipherMode;
            ofb: IBlockCipherMode;
            ctr: IBlockCipherMode;
            gcm: IBlockCipherMode;
            [index: string]: IBlockCipherMode;
        }

        interface ICipherOptions {
            iv ? : Buffer;
            padding ? : Padding.IPadding;
            additionalAuthenticatedData ? : Buffer;
            authenticationTag ? : Buffer;
        }

        interface ICipherResult {
            data: Buffer;
            authenticationTag ? : Buffer;
            iv ? : Buffer;
            [index: string]: Buffer;
        }


        interface IParityCheck {
            valid: boolean;
            adjustedKey: Buffer;
        }


        interface ICipherStatic {
            cipherAlgo: ICipherAlgoStatic;
            blockCipherMode: IBlockCipherModeStatic;
            cipher(key: Buffer, data: Buffer, cipherAlgo: ICipherAlgo, blockCipherMode: IBlockCipherMode, cipherOpts ? : ICipherOptions): ICipherResult;
            decipher(key: Buffer, data: Buffer, cipherAlgo: ICipherAlgo, blockCipherMode: IBlockCipherMode, cipherOpts ? : ICipherOptions): ICipherResult;
            computeKcv(key: Buffer, cipherAlgo: ICipherAlgo, length ? : number): string;
            checkAndAdjustParity(key: Buffer): IParityCheck;
        }

    }

    interface CryptoLibStatic {
        cipher: Cipher.ICipherStatic;
        padding: Padding.IPaddingStatic;
        util: Util.IUtilStatic;
        error: Error.ErrorStatic;
        pin: Pin.IPinStatic;
        banking: Banking.IBankingStatic;
        random: Random.IRandomStatic;
        messageDigest: MessageDigest.IMessageDigestStatic;
        mac: Mac.IMacStatic;
    }

}


declare var cryptolib: Cryptolib.CryptoLibStatic;