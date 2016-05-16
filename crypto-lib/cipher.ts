import {error} from "./error";
import {util} from "./util";
import {padding} from "./padding";
import {forgeutil} from "./forge-util";
import * as forge from "node-forge";
import {random} from "./random";

import cryptojs = require("crypto-js");

export namespace cipher {
    export interface IBlockCipherMode {
        name: string;
        hasIV: boolean;
        cryptoName: string;
        isStreaming: boolean;
        isAuthenticatedEncryption: boolean;
        supportedBlockSizes?: number[];
    }

    export interface ICipherAlgo {
        blockSize: number;
        name: string;
        cryptoName: string;
        keyLengths?: number[];
        modes: IBlockCipherMode[];
    }

    export interface ICipherAlgoStatic {
        aes: ICipherAlgo;
        des: ICipherAlgo;
        desede: ICipherAlgo;
        [index: string]: ICipherAlgo;
    }

    export interface IBlockCipherModeStatic {
        cbc: IBlockCipherMode;
        ecb: IBlockCipherMode;
        cfb: IBlockCipherMode;
        ofb: IBlockCipherMode;
        ctr: IBlockCipherMode;
        gcm: IBlockCipherMode;
        [index: string]: IBlockCipherMode;
    }

    export interface ICipherOptions {
        iv?: Buffer;
        padding?: padding.IPadding;
        additionalAuthenticatedData?: Buffer;
        authenticationTag?: Buffer;
    }

    export interface ICipherResult {
        data: Buffer;
        authenticationTag?: Buffer;
        iv?: Buffer;
        [index: string]: Buffer;
    }


    export interface IParityCheck {
        valid: boolean;
        adjustedKey: Buffer;
    }


    export interface ICipherStatic {
        cipherAlgo: ICipherAlgoStatic;
        blockCipherMode: IBlockCipherModeStatic;
        cipher(key: Buffer, data: Buffer, cipherAlgo: ICipherAlgo, blockCipherMode: IBlockCipherMode, cipherOpts?: ICipherOptions): ICipherResult;
        decipher(key: Buffer, data: Buffer, cipherAlgo: ICipherAlgo, blockCipherMode: IBlockCipherMode, cipherOpts?: ICipherOptions): ICipherResult;
        computeKcv(key: Buffer, cipherAlgo: ICipherAlgo, length?: number): string;
        checkAndAdjustParity(key: Buffer): IParityCheck;
    }


    export const blockCipherMode: IBlockCipherModeStatic = {
        ecb: {
            name: "ECB",
            cryptoName: "ecb",
            hasIV: false,
            isAuthenticatedEncryption: false,
            isStreaming: false
        },
        cbc: {
            name: "CBC",
            cryptoName: "cbc",
            hasIV: true,
            isAuthenticatedEncryption: false,
            isStreaming: false
        },
        cfb: {
            name: "CFB",
            cryptoName: "cfb",
            hasIV: true,
            isAuthenticatedEncryption: false,
            isStreaming: false
        },
        ofb: {
            name: "OFB",
            cryptoName: "ofb",
            hasIV: true,
            isAuthenticatedEncryption: false,
            isStreaming: true
        },
        ctr: {
            name: "CTR",
            cryptoName: "ctr",
            hasIV: true,
            isAuthenticatedEncryption: false,
            isStreaming: true
        },
        gcm: {
            name: "GCM",
            cryptoName: "gcm",
            hasIV: true,
            isAuthenticatedEncryption: true,
            isStreaming: true,
            supportedBlockSizes: [16]
        }

    };

    export const cipherAlgo: ICipherAlgoStatic = {
        aes: {
            blockSize: 16,
            name: "AES",
            cryptoName: "aes",
            keyLengths: [128, 192, 256],
            modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr, blockCipherMode.gcm]
        },
        des: {
            blockSize: 8,
            name: "DES",
            cryptoName: "des",
            keyLengths: [64],
            modes: [blockCipherMode.ecb, blockCipherMode.cbc]
        },
        desede: {
            blockSize: 8,
            name: "3DES",
            cryptoName: "des-ede",
            keyLengths: [64, 128, 192],
            modes: [blockCipherMode.ecb, blockCipherMode.cbc, blockCipherMode.cfb, blockCipherMode.ofb, blockCipherMode.ctr]
        }
    };


    function genNullIv(length: number): Buffer {
        let iv = new Buffer(length);
        iv.fill(0);
        return iv;
    }

    function getNodeJsSymCryptoAlgorithm(key: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode) {

        let algo = aCipherAlgo.cryptoName;
        if (aCipherAlgo === cipherAlgo.desede && key.length === 192) {
            algo += "3"; // DESEDE with triple keys
        } else if (aCipherAlgo === cipherAlgo.aes) {
            algo += "-" + key.length * 8;
        }
        if (aBlockCipherMode === blockCipherMode.ecb && aCipherAlgo !== cipherAlgo.aes) {
            return algo;
        }
        algo += "-";
        algo += aBlockCipherMode.cryptoName;

        return algo;

    }

    function toDoubleLengthKey(key: Buffer) {
        let mykey = new Buffer(24);
        key.copy(mykey, 0, 0, 16);
        key.copy(mykey, 16, 0, 8);
        return mykey;
    }


    function doCryptoJSCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode, cipherOpts: ICipherOptions): ICipherResult {

        if (aBlockCipherMode === blockCipherMode.gcm) {
            error.raiseInvalidArg("GCM block cipher mode of operation is not supported by CryptoJS library");
        }
        let keyHex: string;
        if (aCipherAlgo === cipherAlgo.desede && key.length === 16) {
            keyHex = toDoubleLengthKey(key).toString("hex");
        } else {
            keyHex = key.toString("hex");
        }
        let dataWord = cryptojs.enc.Hex.parse(data.toString("hex"));
        let keyWord = cryptojs.enc.Hex.parse(keyHex);
        let algo = aCipherAlgo.name;
        if (aCipherAlgo === cipherAlgo.desede) {
            algo = "TripleDES";
        }
        let cryptoJsOpts: any = {};
        cryptoJsOpts.mode = cryptojs.mode[aBlockCipherMode.name];
        cryptoJsOpts.padding = cryptojs.pad.NoPadding;
        if (cipherOpts.iv) {
            cryptoJsOpts.iv = cryptojs.enc.Hex.parse(cipherOpts.iv.toString("hex"));
        }
        if (cipherMode) {
            let encrypted = cryptojs[algo].encrypt(dataWord, keyWord, cryptoJsOpts);
            return {
                data: new Buffer(encrypted.ciphertext.toString(cryptojs.enc.Hex), "hex")
            };
        } else {

            let decrypted = cryptojs[algo].decrypt({
                ciphertext: dataWord,
                salt: ""
            }, keyWord, cryptoJsOpts);
            return {
                data: new Buffer(decrypted.toString(cryptojs.enc.Hex), "hex")
            };
        }

    }

    function getForgeCryptoAlgo(aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode) {

        let forgeCryptoAlgo: string = null;
        if (aCipherAlgo === cipherAlgo.aes) {
            forgeCryptoAlgo = "AES-";
        } else if (aCipherAlgo === cipherAlgo.des || aCipherAlgo === cipherAlgo.desede) {
            forgeCryptoAlgo = "DES-";
        } else {
            error.raiseInvalidArg("Unexpected cipher algo " + cipherAlgo);
        }

        forgeCryptoAlgo += aBlockCipherMode.name;

        return forgeCryptoAlgo;

    }

    function doForgeCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode, cipherOpts: ICipherOptions): ICipherResult {

        let cipher: any;

        let forgeCryptoAlgo = getForgeCryptoAlgo(aCipherAlgo, aBlockCipherMode);
        let keyBuffer = forgeutil.toForgeBuffer(key);

        if (aCipherAlgo === cipherAlgo.desede && key.length === 16) {
            let mykey = toDoubleLengthKey(key);
            keyBuffer = forgeutil.toForgeBuffer(mykey);
        }

        if (cipherMode) {
            cipher = forge.cipher.createCipher(forgeCryptoAlgo, keyBuffer);
        } else {
            cipher = forge.cipher.createDecipher(forgeCryptoAlgo, keyBuffer);
        }
        let forgeOpts: any = {};
        if (cipherOpts.iv) {
            forgeOpts.iv = forgeutil.toForgeBuffer(cipherOpts.iv);
        }
        if (cipherOpts.additionalAuthenticatedData) {
            forgeOpts.additionalData = forgeutil.toForgeBuffer(cipherOpts.additionalAuthenticatedData);
            if (!cipherMode) {
                if (!cipherOpts.authenticationTag) {
                    error.raiseInvalidArg("Authentication tag is missing for block cipher mode " + aBlockCipherMode.name);
                }
                forgeOpts.tag = forgeutil.toForgeBuffer(cipherOpts.authenticationTag);
            }
        }
        if (aBlockCipherMode === blockCipherMode.gcm) {
            forgeOpts.tagLength = 128;
        }
        cipher.start(forgeOpts);
        cipher.update(forgeutil.toForgeBuffer(data));
        let pass = cipher.finish();

        if (aBlockCipherMode.isAuthenticatedEncryption && !cipherMode && !pass) {
            throw new error.CryptoError(error.AUTHENTICATED_TAG_INVALID);
        }

        // awful substring since forge returns more than expected
        // might be due to their ByteStringBuffer implementation, move to DataBuffer
        // when they support if
        let result: ICipherResult = {
            data: new Buffer(cipher.output.toHex().substring(0, data.length * 2), "hex")
        };

        if (aBlockCipherMode.isAuthenticatedEncryption && cipherMode) {
            result.authenticationTag = new Buffer(cipher.mode.tag.toHex(), "hex");
        }
        return result;
    }

    // function doNodeJsCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
    //     aBlockCipherMode: IBlockCipherMode, iv: Buffer) {

    //     let cipher: any;
    //     let nodeJsCryptoAlgo = getNodeJsSymCryptoAlgorithm(key, aCipherAlgo, aBlockCipherMode);
    //     if (cipherMode) {
    //         cipher = require("crypto").createCipheriv(nodeJsCryptoAlgo, key, iv);
    //     } else {
    //         cipher = require("crypto").createDecipheriv(nodeJsCryptoAlgo, key, iv);
    //     }

    //     cipher.setAutoPadding(false);

    //     return Buffer.concat([cipher.update(data), cipher.final()]);
    // }



    function doCipher(cipherMode: boolean, key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode, cipherOpts: ICipherOptions): ICipherResult {

        if (aCipherAlgo.modes.indexOf(aBlockCipherMode) < 0) {
            error.raiseInvalidArg("The block cipher " + aBlockCipherMode.name + " is not valid for cipher algo " + aCipherAlgo.name);
        }
        let dataToProcess = data;
        let iv: Buffer = cipherOpts && cipherOpts.iv ? cipherOpts.iv : null;
        if (cipherMode && cipherOpts && cipherOpts.padding) {
            dataToProcess = cipherOpts.padding.pad(data, aCipherAlgo.blockSize);
        }

        if (!iv && aBlockCipherMode.hasIV) {
            if (aBlockCipherMode === blockCipherMode.cbc || aBlockCipherMode === blockCipherMode.cfb ||
                    aBlockCipherMode === blockCipherMode.ofb || aBlockCipherMode === blockCipherMode.ctr) {
                iv = genNullIv(aCipherAlgo.blockSize);
                cipherOpts.iv = iv;
            } else if (aBlockCipherMode === blockCipherMode.ctr || aBlockCipherMode === blockCipherMode.gcm) {
                if (cipherMode) {
                    iv = new Buffer(16);
                    random.generate(12).copy(iv);
                    iv.fill(0, 12, 16);
                } else {
                    // Assume null iv is wanted
                    iv = genNullIv(16);
                }
                cipherOpts.iv = iv;
            }
        }

        // let result = doNodeJsCipher(cipherMode,key,dataToProcess,aCipherAlgo,aBlockCipherMode,iv);

        // only use forge so far for GCM cipher mode
        let cipherResult = aBlockCipherMode === blockCipherMode.gcm ?
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

    export function cipher(key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode, cipherOpts: ICipherOptions) {
        return doCipher(true, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
    }

    export function decipher(key: Buffer, data: Buffer, aCipherAlgo: ICipherAlgo,
        aBlockCipherMode: IBlockCipherMode, cipherOpts: ICipherOptions) {
        return doCipher(false, key, data, aCipherAlgo, aBlockCipherMode, cipherOpts);
    }

    export function computeKcv(key: Buffer, aCipherAlgo: ICipherAlgo, length?: number): string {
        if (length && length > aCipherAlgo.blockSize) {
            error.raiseInvalidArg(`Invalid KCV length ${length} must be lower or equal than ${aCipherAlgo.blockSize}`);
        }

        let data = new Buffer(aCipherAlgo.blockSize);
        data.fill(0);
        let encData = doCipher(true, key, data, aCipherAlgo, blockCipherMode.ecb, {
            padding: padding.noPadding
        });
        let result = util.toHex(encData.data);
        return length ? result.substr(0, length * 2) : result;
    }

    function adjustByte(abyte: number) {
        let numOdd = 0;
        for (let i = 0; i < 8; i++) {
            numOdd ^= abyte >>> i & 0x01;
        }
        return numOdd === 1 ? abyte : abyte ^ 0x01;
    }

    export function checkAndAdjustParity(key: Buffer): IParityCheck {
        let adjustedKey = new Buffer(key.length);
        for (let i = 0; i < key.length; i++) {
            let adjustedByte = adjustByte(key[i]);
            adjustedKey[i] = adjustedByte;
        }

        return {
            valid: adjustedKey.toString("hex") === key.toString("hex"),
            adjustedKey: adjustedKey
        };

    }
}
