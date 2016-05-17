import * as chai from "chai";
import * as forge from "node-forge";
import {util} from "../../../crypto-lib/";
import * as jsrsasign from "jsrsasign";

const assert = chai.assert;

let fixtures:any = {};

try {
    if (typeof window === "undefined") {
        const fs = require("fs");
        const yaml = require("js-yaml");
        fixtures.asymmetric = yaml.load(fs.readFileSync(`${__dirname}/asymmetric-fixtures.yml`, "utf-8"));
    } else {
        fixtures.asymmetric = require("json!yaml!./asymmetric-fixtures.yml");
    }
} catch (e) {
    console.log("Failed loading YAML :" + e);
    throw e;
}

const rsaPrivateKeys: string[] = fixtures.asymmetric.private.rsa;

// let utf16ToHex = function(s) {
//     let length = s.length;
//     let index = -1;
//     let result = "";
//     while (++index < length) {
//         result += s.charCodeAt(index).toString(16).toUpperCase(); // TODO : prefix with 0
//     }
//     return result;
// };

describe("Load", () => {

    let createPemLoadTest = (key, val) => {

        let isEncrypted = val.match(/ENCRYPTED/i) != null;
        it("load " + key + " pem", () => {

            let rsaKey = isEncrypted ? forge.pki.decryptRsaPrivateKey(val, "cryptocalcpass") :
                forge.pki.privateKeyFromPem(val);
            assert.isNotNull(rsaKey.n);
        });
        if (isEncrypted) {
            it("load " + key + " with invalid password ", () => {
                let rsaKey = null;
                try {
                    rsaKey = forge.pki.decryptRsaPrivateKey(val, "dummy");
                } catch (e) {
                    // Do nothing
                }
                // it seems that it does not always throw exception...
                if (null != rsaKey) {
                    assert.fail("Should have thrown exception for key " + key + "rsa key " + rsaKey);
                }


            });

        }


    }
    for (let key in rsaPrivateKeys) {
        createPemLoadTest(key, rsaPrivateKeys[key]);
    }

})

describe("Encrypt", () => {

    it("Encrypt with RAW public key", () => {
        let params = {
            n: "00eb6918789b2fc51ef8c5cf3ee7e472b3444b8d2b093e4b44853d3234d9f3fee8c06e5b02c88503d5f1877b992b54f9400eb88cd2556e9da88c702d37258fbb0b",
            e: "010001"
        };
        let key = jsrsasign.KEYUTIL.getKey(params);

        // let x = new BigInteger(eb.toHex(), 16); // hex value
        let BigInteger = forge.jsbn.BigInteger;
        console.log(key.e.toString(16));
        console.log(key.n.toString(16));
        let exp = new BigInteger(key.e.toString(16), 16); // new BigInteger(params.e,16)
        let modulus = new BigInteger(key.n.toString(16), 16); // new BigInteger(params.n,16)

        let publicKey = forge.pki.setRsaPublicKey(modulus, exp);
        let fBuffer = forge.util.createBuffer(util.toArrayBuffer(new Buffer("aabbccdd", "hex")));
        let encrypted = publicKey.encrypt(fBuffer.getBytes(), "RSAES-PKCS1-V1_5");
        // let encrypted = publicKey.encrypt(fBuffer.getBytes(), "RSA-OAEP");
        // let encrypted = publicKey.encrypt(fBuffer.getBytes());
        let result = forge.util.createBuffer(encrypted).toHex();
        assert.equal(result.length, 128);

    });

});
