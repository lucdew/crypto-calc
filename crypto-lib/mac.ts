import {util} from "./util";
import {md} from "./message-digest";

export namespace mac {

    function doHmac(aMessageDigest: md.IMessageDigestType, key: Buffer, data: Buffer): Buffer {

        let blockSizeInBytes = aMessageDigest.blockSize / 8;

        if (key.length > blockSizeInBytes) {
            key = md.digest(aMessageDigest, key); // keys longer than blocksize are shortened
        }

        if (key.length < blockSizeInBytes) {
            let paddedKeyHex = util.rightPad(key.toString("hex"), blockSizeInBytes * 2, "0");
            key = new Buffer(paddedKeyHex, "hex");
        }

        let oKeyPad = new Buffer(blockSizeInBytes);
        oKeyPad.fill(0x5c);
        oKeyPad = util.xor(key, oKeyPad); // Where blocksize is that of the underlying hash function

        let iKeyPad = new Buffer(blockSizeInBytes);
        iKeyPad.fill(0x36);
        iKeyPad = util.xor(key, iKeyPad); // Where blocksize is that of the underlying hash function

        let xorIKeyPadMessage = md.digest(aMessageDigest, Buffer.concat([iKeyPad, data]));
        return md.digest(aMessageDigest, Buffer.concat([oKeyPad, xorIKeyPadMessage]));


    }

    export function hmac(aMessageDigest: md.IMessageDigestType, key: Buffer, data: Buffer): Buffer {
        return doHmac(aMessageDigest, key, data);
    }

}
