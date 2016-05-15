/// <reference path="../typings/main/ambient/buffer/index.d.ts"/>
///<reference path="../typings/main/ambient/crypto-js/index.d.ts"/>
/// <reference path="../typings/main/ambient/node-forge/index.d.ts"/>

import {error} from './error';
import {forgeutil} from './forge-util';
import * as forge from 'node-forge';
import * as cryptojs from 'crypto-js';

export namespace md {
    export interface IMessageDigestType {
    name: string;
    digestSize: number;
    blockSize: number;
    security: number;
}

export interface IMessageDigestTypeStatic {
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

export var messageDigestType: IMessageDigestTypeStatic = {

    MD5: {
        name: 'MD5',
        digestSize: 128,
        blockSize: 512,
        security: 64
    },
    SHA1: {
        name: 'SHA1',
        digestSize: 160,
        blockSize: 512,
        security: 80
    },
    SHA2_224: {
        name: 'SHA2_224',
        digestSize: 224,
        blockSize: 512,
        security: 112
    },
    SHA2_256: {
        name: 'SHA2_256',
        digestSize: 256,
        blockSize: 512,
        security: 128
    },
    SHA2_384: {
        name: 'SHA2_384',
        digestSize: 384,
        blockSize: 1024,
        security: 192
    },
    SHA2_512: {
        name: 'SHA2_512',
        digestSize: 512,
        blockSize: 1024,
        security: 256
    },
    SHA2_512_224: {
        name: 'SHA2_512_224',
        digestSize: 224,
        blockSize: 1024,
        security: 112
    },
    SHA2_512_256: {
        name: 'SHA2_512_256',
        digestSize: 256,
        blockSize: 1024,
        security: 128
    },
    SHA3_224: {
        name: 'SHA3_224',
        digestSize: 224,
        blockSize: 1152,
        security: 112
    },
    SHA3_256: {
        name: 'SHA3_256',
        digestSize: 256,
        blockSize: 1088,
        security: 128
    },
    SHA3_384: {
        name: 'SHA3_384',
        digestSize: 384,
        blockSize: 832,
        security: 192
    },
    SHA3_512: {
        name: 'SHA3_512',
        digestSize: 512,
        blockSize: 576,
        security: 256
    }
}


export function digest(messageDigest: IMessageDigestType, data: Buffer): Buffer {

    var word = cryptojs.enc.Hex.parse(data.toString('hex'));
    var hash: any;

    if (messageDigest === messageDigestType.MD5) {
        hash = cryptojs.MD5(word);
    } else if (messageDigest === messageDigestType.SHA1) {
        hash = cryptojs.SHA1(word);
    } else if (messageDigest === messageDigestType.SHA2_224) {
        hash = cryptojs.SHA224(word);
    } else if (messageDigest === messageDigestType.SHA2_256) {
        hash = cryptojs.SHA256(word);
    } else if (messageDigest === messageDigestType.SHA2_384) {
        hash = cryptojs.SHA384(word);
    } else if (messageDigest === messageDigestType.SHA2_512) {
        hash = cryptojs.SHA512(word);
    } else if (messageDigest === messageDigestType.SHA2_512_224) {
        var md = forge.sha512.sha224.create();
        md.update(forgeutil.bufferToString(data));
        return new Buffer(md.digest().toHex(), 'hex');
    } else if (messageDigest === messageDigestType.SHA2_512_256) {
        var md = forge.sha512.sha256.create();
        md.update(forgeutil.bufferToString(data));
        return new Buffer(md.digest().toHex(), 'hex');
    } else if (messageDigest.name.indexOf('SHA3') === 0) {
        hash = cryptojs.SHA3(word, {
            outputLength: messageDigest.digestSize
        });
    } else {
        error.raiseInvalidArg('Unsupported message digest ' + messageDigest.name ? messageDigest.name : 'null');
    }
    return new Buffer(hash.toString(cryptojs.enc.Hex), 'hex');
}
    
    
}
