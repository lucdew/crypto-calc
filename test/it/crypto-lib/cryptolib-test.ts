import {util, padding, error, pin, mac, banking, cipher, md} from "../../../crypto-lib/";
import * as _ from "lodash";
import * as chai from "chai";

const assert = chai.assert;
const expect = chai.expect;

let fixtures: any = {};

try {
    if (typeof window === "undefined") {
        const fs = require("fs");
        const yaml = require("js-yaml");
        _.forEach(["padding", "cipher", "messageDigest"], (testSuite) => {
           fixtures[testSuite] = yaml.load(fs.readFileSync(`${__dirname}/${testSuite}-fixtures.yml`, "utf-8"));
        });
    } else {
        fixtures.padding = require("json!yaml!./padding-fixtures.yml");
        fixtures.cipher = require("json!yaml!./cipher-fixtures.yml");
        fixtures.messageDigest = require("json!yaml!./messageDigest-fixtures.yml");
    }

} catch (e) {
    console.log("Failed loading YAML :" + e);
    throw e;
}

function b(hex: string): Buffer {
    return new Buffer(hex, "hex");
}

function assertCryptoError(fn: () => void, errorCode: error.IErrorCode) {

    try {
        fn();
    } catch (e) {
        if (e instanceof error.CryptoError) {
            assert.equal( < error.CryptoError > e.getCode(), errorCode);
            return;
        }
    }
    assert.fail("Should have thrown a crypto error ");
}


describe("Padding", () => {


    function assertPad(paddingName:string, testOpts, testName: string) {
        let pad = padding[paddingName].pad;
        return () => {
            if (testOpts.expectedError) {
                assertCryptoError(pad.bind(this, testOpts.data, testOpts.size ? testOpts.size : 8),
                     ( < any > error)[testOpts.expectedError]);
            } else {
                if (testOpts.expectedRegex) {
                    assert.match(pad(b(testOpts.data), testOpts.size ? testOpts.size : 8,
                        testOpts.optional).toString("hex"), new RegExp(testOpts.expectedRegex));
                } else {
                    assert.equal(pad(b(testOpts.data), testOpts.size ? testOpts.size : 8,
                         testOpts.optional).toString("hex"), testOpts.expected);
                }
            }
        };
    }

    function assertUnpad(paddingName, testOpts, testName: string) {
        let unpad = padding[paddingName].unpad;
        return () => {
            if (testOpts.expectedError) {
                assertCryptoError(unpad.bind(this, testOpts.data), ( < any > error)[testOpts.expectedError]);
            } else {
                assert.equal(unpad(b(testOpts.data)).toString("hex"), testOpts.expected);
            }
        };
    }


    _.forEach(fixtures.padding, (aPadding, aPaddingName) => {

        describe("pad/unpad " + aPaddingName, () => {
            _.forEach(aPadding.pad, (testOpts , testName) => {
                    it(testName, assertPad(aPaddingName, testOpts, testName));
            });

            _.forEach(aPadding.unpad, (testOpts , testName) => {
                it(testName, assertUnpad(aPaddingName, testOpts, testName));
            });
        });


    });

    describe("getPaddingTypes", () => {

        it("should return list of padding types", () => {
            let result = util.values(padding);
            expect(result).to.have.deep.property("[0].name", "NO_PADDING");
            expect(result).to.have.deep.property("[1].name", "PKCS7");
            expect(result).to.have.deep.property("[2].name", "ISO_7816_4");
        });

    })


});


describe("Cipher", () => {

    describe("getCipherAlgos", () => {

        it("should return list of cipher algo", () => {
            let result = util.values(cipher.cipherAlgo);
            expect(result).to.have.deep.property("[0].name", "AES");
            expect(result).to.have.deep.property("[1].name", "DES");
            expect(result).to.have.deep.property("[2].name", "3DES");

        });

    })

    describe("getBlockCipherModes", () => {

        it("should return list of block cipher modes", () => {
            let result = util.values(cipher.blockCipherMode);
            expect(result).to.have.deep.property("[0].name", "ECB");
            expect(result).to.have.deep.property("[1].name", "CBC");
            expect(result).to.have.deep.property("[2].name", "CFB");
            expect(result).to.have.deep.property("[3].name", "OFB");
            expect(result).to.have.deep.property("[4].name", "CTR");
            expect(result).to.have.deep.property("[5].name", "GCM");
        });

    });


    describe("computeKCV", () => {

        it("should return a valid 3DES 128 bit key KCV with valid data", () => {
            let result = cipher.computeKcv(util.fromHex("FB44403370B3E3822C79AEBEB9436E40"), cipher.cipherAlgo.desede);
            assert.equal(result, "4C0CD2DFA71E4116");
        });

        it("should return a 3 bytes long when 3 bytes are queried", () => {
            let result = cipher.computeKcv(util.fromHex("FB44403370B3E3822C79AEBEB9436E40"),
                                cipher.cipherAlgo.desede, 3);
            assert.equal(result, "4C0CD2");
        });

        it("should return a valid AES 128 bit key KCV with valid data", () => {
            let result = cipher.computeKcv(util.fromHex("00112233445566770011223344556677"),
                                cipher.cipherAlgo.aes);
            assert.equal(result, "6F5D889E98125783B76D810B3394F2A7");
        });

        it("should return a valid AES 256 bit key KCV with valid data", () => {
            let result = cipher.computeKcv(util.fromHex("0011223344556677001122334455667700112233445566770011223344556677"),
                                cipher.cipherAlgo.aes);
            assert.equal(result, "EBB180AE9D31F1C2C2C9482D62A97C56");
        });

        it("should raise crypto error when length is invalid", () => {

            assertCryptoError(cipher.computeKcv.bind(this, util.fromHex("FB44403370B3E3822C79AEBEB9436E40"),
                                cipher.cipherAlgo.aes, 17), error.INVALID_ARGUMENT);

        });


    });

    function createCipherDecipherTest(operation: string, cipherAlgoName: string, testName: string, test: any) {
        let key = new Buffer(test.key, "hex");
        let data = new Buffer(test.data, "hex");
        let cipherMode = cipher.blockCipherMode[test.cipherMode];
        let cipherAlgo = cipher.cipherAlgo[cipherAlgoName];
        let cipherOpts: any = {};
        cipherOpts.padding = padding[test.padding];
        if (test.additionalAuthenticatedData) {
            cipherOpts.additionalAuthenticatedData = new Buffer(test.additionalAuthenticatedData, "hex");
        }
        if (test.authenticationTag) {
            cipherOpts.authenticationTag = new Buffer(test.authenticationTag, "hex");
        }
        if (test.iv) {
            cipherOpts.iv = new Buffer(test.iv, "hex");
        }
        if (operation === "cipher") {
            it("cipher " + testName, () => {
                let result = cipher.cipher(key, data, cipherAlgo, cipherMode, cipherOpts);
                if (typeof(test.expected) === "string") {
                    assert.equal(result.data.toString("hex").toUpperCase(), test.expected);
                } else {
                    for (let expectedKey in test.expected) {
                        assert.equal(result[expectedKey].toString("hex").toUpperCase(), test.expected[expectedKey]);
                    }
                }

            });
            it("decipher " + testName, () => {

                let result: cipher.ICipherResult = null;
                if (typeof(test.expected) === "string") {
                    result = cipher.decipher(key, new Buffer(test.expected, "hex"),
                        cipherAlgo, cipherMode, cipherOpts);
                } else {
                    if (test.expected.authenticationTag) {
                        cipherOpts.authenticationTag = new Buffer(test.expected.authenticationTag, "hex");
                    }
                    result = cipher.decipher(key, new Buffer(test.expected.data, "hex"),
                        cipherAlgo, cipherMode, cipherOpts);
                }
                assert.equal(result.data.toString("hex"), test.data);

            });
        } else if (operation === "decipher") {
            it("decipher " + testName, () => {

                let result: cipher.ICipherResult = null;
                if (test.expectedError) {
                    assertCryptoError(cipher.decipher.bind(this, key, data, cipherAlgo, cipherMode, 
                        cipherOpts), ( < any > error)[test.expectedError]);
                } else {
                    result = cipher.decipher(key, data,
                        cipherAlgo, cipherMode, cipherOpts);
                    if (typeof(test.expected) === "string") {
                        assert.equal(result.data.toString("hex").toUpperCase(), test.expected);
                    } else {
                        for (let expectedKey in test.expected) {
                            assert.equal(result[expectedKey].toString("hex").toUpperCase(), test.expected[expectedKey]);
                        }
                    }

                }

            });
        }


    }


    function createCipherTestsfunc(cipherAlgo: string) {
        return () => {
            for (let testName in fixtures.cipher[cipherAlgo].cipher) {
                let test = fixtures.cipher[cipherAlgo].cipher[testName];
                createCipherDecipherTest("cipher", cipherAlgo, testName, test);
            }
            for (let testName in fixtures.cipher[cipherAlgo].decipher) {
                let test = fixtures.cipher[cipherAlgo].decipher[testName];
                createCipherDecipherTest("decipher", cipherAlgo, testName, test);
            }
        };
    }

    for (let cipherAlgo in fixtures.cipher) {
        describe(cipherAlgo, createCipherTestsfunc(cipherAlgo));
    }

    //  describe("ciphering/deciphering",() => {

    // 	it("should final cipher data with padding", () => {
    // 		let clearData = "abcde";
    // 		let key = new Buffer("01020304050607080102030405060708");
    // 		let cipherRes = cipher.cipher(key,new Buffer(clearData,"ascii"),
    // 			cipher.cipherAlgo.aes,cipher.blockCipherMode.cbc,{padding: padding.iso78164});


    // 		let result = cipher.decipher(key,cipherRes.data,
    // 			cipher.cipherAlgo.aes,cipher.blockCipherMode.cbc,{padding: padding.iso78164});

    // 		assert.equal(result.data.toString("ascii"),clearData);
    // 	});

    // });

    describe("Check Parity", () => {

        // it("Check Parity"), () => {

        //     // TODO failure with key
        //     //215C4C4981A24148E21BB6E0F848A462
        // }

    });

});

describe("Pin", () => {


    describe("toPinBlock", () => {

        it("should generate a valid pin block 0", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPin(pin.isoPinType.format0, "1234", "111122224444");
            let pinBlock = isoPin.toBlock().toString("hex").toUpperCase();
            assert.equal(pinBlock, "041225EEDDDDBBBB");
            assert.equal(pinBlock.length, 16);
        });
        it("should generate a valid pin block 1", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPin(pin.isoPinType.format1, "1234");
            let pinBlock = isoPin.toBlock().toString("hex").toUpperCase();
            assert.equal(pinBlock.substring(0, 6), "141234");
            assert.equal(pinBlock.length, 16);
        });
        it("should generate a valid pin block 2", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPin(pin.isoPinType.format2, "1234");
            let pinBlock = isoPin.toBlock().toString("hex").toUpperCase();
            assert.equal(pinBlock, "241234FFFFFFFFFF");
            assert.equal(pinBlock.length, 16);
        });
        it("should generate a valid pin block 3", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPin(pin.isoPinType.format3, "1234", "111122224444");
            let pinBlock = isoPin.toBlock().toString("hex").toUpperCase();
            assert.equal(pinBlock.substring(0, 6), "341225");
            assert.equal(pinBlock.length, 16);
        });

        it("should generate a valid pin block 2 when pin is of max length", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPin(pin.isoPinType.format2, "12345678901234");
            let pinBlock = isoPin.toBlock().toString("hex").toUpperCase();
            assert.equal(pinBlock, "2E12345678901234");
            assert.equal(pinBlock.length, 16);
        });


    });


    describe("fromPinBlock", () => {

        it("should generate a valid pin from block 0", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPinFromBlock(new Buffer("041225EEDDDDBBBB", "hex"), "111122224444");
            assert.equal(isoPin.pin, "1234");
            assert.equal(isoPin.additionalData, "111122224444");
        });
        it("should generate a valid pin from block 1", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPinFromBlock(new Buffer("1412341324490641", "hex"));
            assert.equal(isoPin.pin, "1234");
        });
        it("should generate a valid pin from block 2", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPinFromBlock(new Buffer("241234FFFFFFFFFF", "hex"));
            assert.equal(isoPin.pin, "1234");
        });
        it("should generate a valid pin from block 3", () => {
            let isoPin: pin.IIsoPin = pin.createIsoPinFromBlock(new Buffer("341225ED9EECF89F", "hex"), "111122224444");
            assert.equal(isoPin.pin, "1234");
            assert.equal(isoPin.additionalData, "111122224444");
        });

        it("should throw a missing pin error when pan is missing", () => {
            try {
                pin.createIsoPinFromBlock(new Buffer("341225ED9EECF89F", "hex"));
            } catch (e) {
                if (e instanceof error.CryptoError) {
                    let cryptoError = < error.CryptoError > e;
                    assert.equal(cryptoError.code, error.PAN_MISSING);
                    assert.equal(cryptoError.additionalInfo.pinLength, 4);
                    assert.equal(cryptoError.additionalInfo.pinType, pin.isoPinType.format3);
                    return;
                }
            }
            assert.fail();

        });


    });
});

describe("Banking", () => {


    describe("Create PAN", () => {
        it("should parse a valid VISA card and parse valid information", () => {
            let pan: banking.IPan = banking.createPanFromString("4444333322221111");
            assert.isTrue(pan.isValid());
            assert.equal(pan.issuingNetwork, banking.issuingNetwork.Visa);
            assert.equal(pan.individualAccountIdentifier, "332222111");
            assert.equal(pan.majorIndustryIdentifer, "4");
            assert.equal(pan.issuerIdentificationNumber, "444433");
            assert.equal(pan.formatForIso9564Pin(), "433332222111");
            assert.equal(pan.checkDigit, "1");
        });
        it("American Express", () => {
            assert.equal(
                banking.createPanFromString("378282246310005").issuingNetwork,
                banking.issuingNetwork.Amex);
            assert.equal(
                banking.createPanFromString("371449635398431").issuingNetwork,
                banking.issuingNetwork.Amex);
            assert.equal(
                banking.createPanFromString("378734493671000").issuingNetwork,
                banking.issuingNetwork.Amex);
        });
        it("Diners", () => {
            assert.equal(
                banking.createPanFromString("30569309025904").issuingNetwork,
                banking.issuingNetwork.DinersClubInternational);
            assert.equal(
                banking.createPanFromString("38520000023237").issuingNetwork,
                banking.issuingNetwork.DinersClubInternational);
        });
        it("Discover", () => {
            assert.equal(
                banking.createPanFromString("6011111111111117").issuingNetwork,
                banking.issuingNetwork.DiscoverCard);
            assert.equal(
                banking.createPanFromString("6011000990139424").issuingNetwork,
                banking.issuingNetwork.DiscoverCard);
        });
        it("JCB", () => {
            assert.equal(
                banking.createPanFromString("3530111333300000").issuingNetwork,
                banking.issuingNetwork.JCB);
            assert.equal(
                banking.createPanFromString("3566002020360505").issuingNetwork,
                banking.issuingNetwork.JCB);
        });
        it("Laser", () => {
            assert.equal(
                banking.createPanFromString("630495060000000000").issuingNetwork,
                banking.issuingNetwork.Laser);
            assert.equal(
                banking.createPanFromString("630490017740292441").issuingNetwork,
                banking.issuingNetwork.Laser);
        });
        it("Mastercard", () => {
            assert.equal(
                banking.createPanFromString("5555555555554444").issuingNetwork,
                banking.issuingNetwork.MasterCard);
            assert.equal(
                banking.createPanFromString("5454545454545454").issuingNetwork,
                banking.issuingNetwork.MasterCard);
            assert.equal(
                banking.createPanFromString("5105105105105100").issuingNetwork,
                banking.issuingNetwork.MasterCard);
        });
        it("Maestro", () => {
            assert.equal(
                banking.createPanFromString("6759649826438453").issuingNetwork,
                banking.issuingNetwork.Maestro);
            assert.equal(
                banking.createPanFromString("6799990100000000019").issuingNetwork,
                banking.issuingNetwork.Maestro);
        });

    });
    describe("Add check digit", () => {
        it("should add a valid check digit", () => {
            let checkDigit = banking.computeCheckDigit("444433332222111");
            assert.equal(checkDigit, "1");
        });
    });


});

describe("MessageDigest", () => {

    function createMessageDigestTestsfunc(digestAlgo: string, digestTest: any) {

        it(digestAlgo, () => {
            assert.equal(md.digest(md.messageDigestType[digestAlgo], b(digestTest.valid.data)).toString("hex"),
                digestTest.valid.expected);
        });

    }

    for (let digestAlgo in fixtures.messageDigest) {
        console.log(digestAlgo);
        let digestTest = fixtures.messageDigest[digestAlgo];
        createMessageDigestTestsfunc(digestAlgo, digestTest);
    }




});

describe("Mac", () => {

    let hmac = mac.hmac;

    let key = b("01020304"); // key size lower than block size
    let longKey64 = b("0011223344556677889900112233445566778899001122334455667788990011223344556677889900112233445566778899" +
        "0011223344556677889900112233");
    let longKey70 = b("0011223344556677889900112233445566778899001122334455667788990011223344556677889900112233445566778899" +
        "0011223344556677889900112233445566778899");
    let data = b("746573746D65");

    describe("HMac", () => {
        it("HMacMD5", () => {
            assert.equal(hmac(md.messageDigestType.MD5, key, data).toString("hex"), "9089d029bd7e826a9c80090725682f11");
        });
        it("HMacMD5 with key longer than block size (>64)", () => {
            assert.equal(hmac(md.messageDigestType.MD5, longKey70, data).toString("hex"), "78c2cbe8fbdf2a9ec5608b446b9d883e");
        });
        it("HMacMD5 with key equals to block size (=64)", () => {
            assert.equal(hmac(md.messageDigestType.MD5, longKey64, data).toString("hex"), "0accd14b9b46b464c6dbf8c1df3feb62");
        });
        it("HMacSHA1", () => {
            assert.equal(hmac(md.messageDigestType.SHA1, key, data).toString("hex"), "7caea159fec98c5ccd6ed215c394d8d14113c8be");
        });
        it("HMacSHA2_224", () => {
            assert.equal(hmac(md.messageDigestType.SHA2_224, key, data).toString("hex"),
                             "a54bd4c230b9dbd6585f4ca7e8a633749e5e85929b22ea0ce5434fdd");
        });
        it("HMacSHA2_256", () => {
            assert.equal(hmac(md.messageDigestType.SHA2_256, key, data).toString("hex"),
                             "143275d97380ce4f8ba98e592b1ff1697d15517aa58c7fc0e245112ccdcc66fc");
        });
        it("HMacSHA2_384", () => {
            assert.equal(hmac(md.messageDigestType.SHA2_384, key, data).toString("hex"),
                             "e9277364d368f48de701829dc182b7a9076fc7e126a8af49ce6dcadda126e7deccb40668fe6a296a849671439b77a6de");
        });
        it("HMacSHA2_512", () => {
            assert.equal(hmac(md.messageDigestType.SHA2_512, key, data).toString("hex"),
              "c8d33479fa6b3347d7904e48c8a0715cfbae890f86e2db224bbef8a3a9299fe02c6c14a5b11e85508fd7f59e5b983f3318172c805d6d274f59f868ca66ef4290");
        });
        it("HMacSHA2_512_224", () => {
            // TODO
        });
        it("HMacSHA2_512_256", () => {
            // TODO
        });
        it("HMacSHA3_224", () => {
            // TODO
        });
        it("HMacSHA3_256", () => {
            // TODO
        });
        it("HMacSHA3_384", () => {
            // TODO
        });
        it("HMacSHA3_512", () => {
            // TODO
        });


    });



});