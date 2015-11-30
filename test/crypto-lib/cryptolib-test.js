/// <reference path="../../d.ts/mocha/mocha.d.ts"/>
/// <reference path="../../d.ts/chai/chai.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>
var _this = this;
if (typeof window === 'undefined') {
    fixtures = {};
    cryptolib = require('./../../crypto-lib/cryptolib-nodejs').cryptolib;
    var fs = require('fs');
    var yaml = require('js-yaml');
    try {
        fixtures['padding'] = yaml.load(fs.readFileSync(__dirname + '/padding-fixtures.yml', 'utf-8'));
        fixtures['cipher'] = yaml.load(fs.readFileSync(__dirname + '/cipher-fixtures.yml', 'utf-8'));
        fixtures['messageDigest'] = yaml.load(fs.readFileSync(__dirname + '/messageDigest-fixtures.yml', 'utf-8'));
    }
    catch (e) {
        console.log("Failed loading YAML :" + e);
        throw e;
    }
    chai = require('chai');
}
else {
    cryptolib = window.webcryptolib.cryptolib;
}
var assert = chai.assert;
var expect = chai.expect;
var util = cryptolib.util;
var cipher = cryptolib.cipher;
function b(hex) {
    return new Buffer(hex, 'hex');
}
function assertCryptoError(fn, errorCode) {
    try {
        fn();
    }
    catch (e) {
        if (e instanceof cryptolib.error.CryptoError) {
            assert.equal(e.getCode(), errorCode);
            return;
        }
    }
    assert.fail('Should have thrown a crypto error ');
}
describe('Padding', function () {
    for (var aPadding in fixtures.padding) {
        function assertPad(padding, testName) {
            var _this = this;
            var pad = cryptolib.padding[padding].pad;
            return function () {
                var test = fixtures.padding[padding]['pad'][testName];
                if (test.expectedError) {
                    assertCryptoError(pad.bind(_this, test.data, test.size ? test.size : 8), cryptolib.error[test.expectedError]);
                }
                else {
                    if (test.expected instanceof RegExp) {
                        assert.match(pad(b(test.data), test.size ? test.size : 8, test.optional).toString('hex'), test.expected);
                    }
                    else {
                        assert.equal(pad(b(test.data), test.size ? test.size : 8, test.optional).toString('hex'), test.expected);
                    }
                }
            };
        }
        function assertUnpad(padding, testName) {
            var _this = this;
            var unpad = cryptolib.padding[padding].unpad;
            return function () {
                var test = fixtures.padding[padding]['unpad'][testName];
                if (test.expectedError) {
                    assertCryptoError(unpad.bind(_this, test.data), cryptolib.error[test.expectedError]);
                }
                else {
                    assert.equal(unpad(b(test.data)).toString('hex'), test.expected);
                }
            };
        }
        describe('pad/unpad ' + aPadding, function () {
            for (var testName in fixtures.padding[aPadding]['pad']) {
                it(testName, assertPad(aPadding, testName));
            }
            for (var testName in fixtures.padding[aPadding]['unpad']) {
                it(testName, assertUnpad(aPadding, testName));
            }
        });
    }
    describe('getPaddingTypes', function () {
        it('should return list of padding types', function () {
            var result = util.values(cryptolib.padding);
            expect(result).to.have.deep.property('[0].name', 'NO_PADDING');
            expect(result).to.have.deep.property('[1].name', 'PKCS7');
            expect(result).to.have.deep.property('[2].name', 'ISO_7816_4');
        });
    });
});
describe('Cipher', function () {
    describe('getCipherAlgos', function () {
        it('should return list of cipher algo', function () {
            var result = util.values(cryptolib.cipher.cipherAlgo);
            expect(result).to.have.deep.property('[0].name', 'AES');
            expect(result).to.have.deep.property('[1].name', 'DES');
            expect(result).to.have.deep.property('[2].name', '3DES');
        });
    });
    describe('getBlockCipherModes', function () {
        it('should return list of block cipher modes', function () {
            var result = util.values(cryptolib.cipher.blockCipherMode);
            expect(result).to.have.deep.property('[0].name', 'ECB');
            expect(result).to.have.deep.property('[1].name', 'CBC');
            expect(result).to.have.deep.property('[2].name', 'CFB');
            expect(result).to.have.deep.property('[3].name', 'OFB');
            expect(result).to.have.deep.property('[4].name', 'CTR');
            expect(result).to.have.deep.property('[5].name', 'GCM');
        });
    });
    describe('computeKCV', function () {
        it('should return a valid 3DES 128 bit key KCV with valid data', function () {
            var result = cryptolib.cipher.computeKcv(util.fromHex('FB44403370B3E3822C79AEBEB9436E40'), cryptolib.cipher.cipherAlgo.desede);
            assert.equal(result, '4C0CD2DFA71E4116');
        });
        it('should return a 3 bytes long when 3 bytes are queried', function () {
            var result = cryptolib.cipher.computeKcv(util.fromHex('FB44403370B3E3822C79AEBEB9436E40'), cryptolib.cipher.cipherAlgo.desede, 3);
            assert.equal(result, '4C0CD2');
        });
        it('should return a valid AES 128 bit key KCV with valid data', function () {
            var result = cryptolib.cipher.computeKcv(util.fromHex('00112233445566770011223344556677'), cryptolib.cipher.cipherAlgo.aes);
            assert.equal(result, '6F5D889E98125783B76D810B3394F2A7');
        });
        it('should return a valid AES 256 bit key KCV with valid data', function () {
            var result = cryptolib.cipher.computeKcv(util.fromHex('0011223344556677001122334455667700112233445566770011223344556677'), cryptolib.cipher.cipherAlgo.aes);
            assert.equal(result, 'EBB180AE9D31F1C2C2C9482D62A97C56');
        });
        it('should raise crypto error when length is invalid', function () {
            assertCryptoError(cryptolib.cipher.computeKcv.bind(_this, util.fromHex('FB44403370B3E3822C79AEBEB9436E40'), cryptolib.cipher.cipherAlgo.aes, 17), cryptolib.error.INVALID_ARGUMENT);
        });
    });
    function createCipherDecipherTest(operation, cipherAlgoName, testName, test) {
        var _this = this;
        var key = new Buffer(test.key, 'hex');
        var data = new Buffer(test.data, 'hex');
        var cipherMode = cipher.blockCipherMode[test.cipherMode];
        var cipherAlgo = cipher.cipherAlgo[cipherAlgoName];
        var cipherOpts = {};
        cipherOpts.padding = cryptolib.padding[test.padding];
        if (test.additionalAuthenticatedData) {
            cipherOpts.additionalAuthenticatedData = new Buffer(test.additionalAuthenticatedData, 'hex');
        }
        if (test.authenticationTag) {
            cipherOpts.authenticationTag = new Buffer(test.authenticationTag, 'hex');
        }
        if (test.iv) {
            cipherOpts.iv = new Buffer(test.iv, 'hex');
        }
        if (operation === 'cipher') {
            it('cipher ' + testName, function () {
                var result = cipher.cipher(key, data, cipherAlgo, cipherMode, cipherOpts);
                if (typeof (test.expected) === 'string') {
                    assert.equal(result.data.toString('hex').toUpperCase(), test.expected);
                }
                else {
                    for (var expectedKey in test.expected) {
                        assert.equal(result[expectedKey].toString('hex').toUpperCase(), test.expected[expectedKey]);
                    }
                }
            });
            it('decipher ' + testName, function () {
                var result = null;
                if (typeof (test.expected) === 'string') {
                    result = cipher.decipher(key, new Buffer(test.expected, 'hex'), cipherAlgo, cipherMode, cipherOpts);
                }
                else {
                    if (test.expected.authenticationTag) {
                        cipherOpts.authenticationTag = new Buffer(test.expected.authenticationTag, 'hex');
                    }
                    result = cipher.decipher(key, new Buffer(test.expected.data, 'hex'), cipherAlgo, cipherMode, cipherOpts);
                }
                assert.equal(result.data.toString('hex'), test.data);
            });
        }
        else if (operation === 'decipher') {
            it('decipher ' + testName, function () {
                var result = null;
                if (test.expectedError) {
                    assertCryptoError(cipher.decipher.bind(_this, key, data, cipherAlgo, cipherMode, cipherOpts), cryptolib.error[test.expectedError]);
                }
                else {
                    result = cipher.decipher(key, data, cipherAlgo, cipherMode, cipherOpts);
                    if (typeof (test.expected) === 'string') {
                        assert.equal(result.data.toString('hex').toUpperCase(), test.expected);
                    }
                    else {
                        for (var expectedKey in test.expected) {
                            assert.equal(result[expectedKey].toString('hex').toUpperCase(), test.expected[expectedKey]);
                        }
                    }
                }
            });
        }
    }
    function createCipherTestsfunc(cipherAlgo) {
        return function () {
            for (var testName in fixtures.cipher[cipherAlgo].cipher) {
                var test = fixtures.cipher[cipherAlgo].cipher[testName];
                createCipherDecipherTest('cipher', cipherAlgo, testName, test);
            }
            for (var testName in fixtures.cipher[cipherAlgo].decipher) {
                var test = fixtures.cipher[cipherAlgo].decipher[testName];
                createCipherDecipherTest('decipher', cipherAlgo, testName, test);
            }
        };
    }
    for (var cipherAlgo in fixtures.cipher) {
        describe(cipherAlgo, createCipherTestsfunc(cipherAlgo));
    }
    describe('Check Parity', function () {
        it('Check Parity'), function () {
        };
    });
});
describe('Pin', function () {
    describe('toPinBlock', function () {
        it('should generate a valid pin block 0', function () {
            var isoPin = cryptolib.pin.createIsoPin(cryptolib.pin.isoPinType.format0, '1234', '111122224444');
            var pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
            assert.equal(pinBlock, '041225EEDDDDBBBB');
            assert.equal(pinBlock.length, 16);
        });
        it('should generate a valid pin block 1', function () {
            var isoPin = cryptolib.pin.createIsoPin(cryptolib.pin.isoPinType.format1, '1234');
            var pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
            assert.equal(pinBlock.substring(0, 6), '141234');
            assert.equal(pinBlock.length, 16);
        });
        it('should generate a valid pin block 2', function () {
            var isoPin = cryptolib.pin.createIsoPin(cryptolib.pin.isoPinType.format2, '1234');
            var pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
            assert.equal(pinBlock, '241234FFFFFFFFFF');
            assert.equal(pinBlock.length, 16);
        });
        it('should generate a valid pin block 3', function () {
            var isoPin = cryptolib.pin.createIsoPin(cryptolib.pin.isoPinType.format3, '1234', '111122224444');
            var pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
            assert.equal(pinBlock.substring(0, 6), '341225');
            assert.equal(pinBlock.length, 16);
        });
        it('should generate a valid pin block 2 when pin is of max length', function () {
            var isoPin = cryptolib.pin.createIsoPin(cryptolib.pin.isoPinType.format2, '12345678901234');
            var pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
            assert.equal(pinBlock, '2E12345678901234');
            assert.equal(pinBlock.length, 16);
        });
    });
    describe('fromPinBlock', function () {
        it('should generate a valid pin from block 0', function () {
            var isoPin = cryptolib.pin.createIsoPinFromBlock(new Buffer('041225EEDDDDBBBB', 'hex'), '111122224444');
            assert.equal(isoPin.pin, '1234');
            assert.equal(isoPin.additionalData, '111122224444');
        });
        it('should generate a valid pin from block 1', function () {
            var isoPin = cryptolib.pin.createIsoPinFromBlock(new Buffer('1412341324490641', 'hex'));
            assert.equal(isoPin.pin, '1234');
        });
        it('should generate a valid pin from block 2', function () {
            var isoPin = cryptolib.pin.createIsoPinFromBlock(new Buffer('241234FFFFFFFFFF', 'hex'));
            assert.equal(isoPin.pin, '1234');
        });
        it('should generate a valid pin from block 3', function () {
            var isoPin = cryptolib.pin.createIsoPinFromBlock(new Buffer('341225ED9EECF89F', 'hex'), '111122224444');
            assert.equal(isoPin.pin, '1234');
            assert.equal(isoPin.additionalData, '111122224444');
        });
        it('should throw a missing pin error when pan is missing', function () {
            try {
                cryptolib.pin.createIsoPinFromBlock(new Buffer('341225ED9EECF89F', 'hex'));
            }
            catch (e) {
                if (e instanceof cryptolib.error.CryptoError) {
                    var cryptoError = e;
                    assert.equal(cryptoError.code, cryptolib.error.PAN_MISSING);
                    assert.equal(cryptoError.additionalInfo.pinLength, 4);
                    assert.equal(cryptoError.additionalInfo.pinType, cryptolib.pin.isoPinType.format3);
                    return;
                }
            }
            assert.fail();
        });
    });
});
describe('Banking', function () {
    describe('Create PAN', function () {
        it('should parse a valid VISA card and parse valid information', function () {
            var pan = cryptolib.banking.createPanFromString('4444333322221111');
            assert.isTrue(pan.isValid());
            assert.equal(pan.issuingNetwork, cryptolib.banking.issuingNetwork.Visa);
            assert.equal(pan.individualAccountIdentifier, '332222111');
            assert.equal(pan.majorIndustryIdentifer, '4');
            assert.equal(pan.issuerIdentificationNumber, '444433');
            assert.equal(pan.formatForIso9564Pin(), '433332222111');
            assert.equal(pan.checkDigit, '1');
        });
        it('American Express', function () {
            assert.equal(cryptolib.banking.createPanFromString('378282246310005').issuingNetwork, cryptolib.banking.issuingNetwork.Amex);
            assert.equal(cryptolib.banking.createPanFromString('371449635398431').issuingNetwork, cryptolib.banking.issuingNetwork.Amex);
            assert.equal(cryptolib.banking.createPanFromString('378734493671000').issuingNetwork, cryptolib.banking.issuingNetwork.Amex);
        });
        it('Diners', function () {
            assert.equal(cryptolib.banking.createPanFromString('30569309025904').issuingNetwork, cryptolib.banking.issuingNetwork.DinersClubInternational);
            assert.equal(cryptolib.banking.createPanFromString('38520000023237').issuingNetwork, cryptolib.banking.issuingNetwork.DinersClubInternational);
        });
        it('Discover', function () {
            assert.equal(cryptolib.banking.createPanFromString('6011111111111117').issuingNetwork, cryptolib.banking.issuingNetwork.DiscoverCard);
            assert.equal(cryptolib.banking.createPanFromString('6011000990139424').issuingNetwork, cryptolib.banking.issuingNetwork.DiscoverCard);
        });
        it('JCB', function () {
            assert.equal(cryptolib.banking.createPanFromString('3530111333300000').issuingNetwork, cryptolib.banking.issuingNetwork.JCB);
            assert.equal(cryptolib.banking.createPanFromString('3566002020360505').issuingNetwork, cryptolib.banking.issuingNetwork.JCB);
        });
        it('Laser', function () {
            assert.equal(cryptolib.banking.createPanFromString('630495060000000000').issuingNetwork, cryptolib.banking.issuingNetwork.Laser);
            assert.equal(cryptolib.banking.createPanFromString('630490017740292441').issuingNetwork, cryptolib.banking.issuingNetwork.Laser);
        });
        it('Mastercard', function () {
            assert.equal(cryptolib.banking.createPanFromString('5555555555554444').issuingNetwork, cryptolib.banking.issuingNetwork.MasterCard);
            assert.equal(cryptolib.banking.createPanFromString('5454545454545454').issuingNetwork, cryptolib.banking.issuingNetwork.MasterCard);
            assert.equal(cryptolib.banking.createPanFromString('5105105105105100').issuingNetwork, cryptolib.banking.issuingNetwork.MasterCard);
        });
        it('Maestro', function () {
            assert.equal(cryptolib.banking.createPanFromString('6759649826438453').issuingNetwork, cryptolib.banking.issuingNetwork.Maestro);
            assert.equal(cryptolib.banking.createPanFromString('6799990100000000019').issuingNetwork, cryptolib.banking.issuingNetwork.Maestro);
        });
    });
    describe('Add check digit', function () {
        it('should add a valid check digit', function () {
            var checkDigit = cryptolib.banking.computeCheckDigit('444433332222111');
            assert.equal(checkDigit, '1');
        });
    });
});
describe('MessageDigest', function () {
    var md = cryptolib.messageDigest;
    function createMessageDigestTestsfunc(digestAlgo, digestTest) {
        it(digestAlgo, function () {
            assert.equal(md.digest(md.messageDigestType[digestAlgo], b(digestTest.valid.data)).toString('hex'), digestTest.valid.expected);
        });
    }
    for (var digestAlgo in fixtures.messageDigest) {
        console.log(digestAlgo);
        var digestTest = fixtures.messageDigest[digestAlgo];
        createMessageDigestTestsfunc(digestAlgo, digestTest);
    }
});
describe('Mac', function () {
    var md = cryptolib.messageDigest;
    var hmac = cryptolib.mac.hmac;
    var key = b('01020304');
    var longKey64 = b('0011223344556677889900112233445566778899001122334455667788990011223344556677889900112233445566778899' +
        '0011223344556677889900112233');
    var longKey70 = b('0011223344556677889900112233445566778899001122334455667788990011223344556677889900112233445566778899' +
        '0011223344556677889900112233445566778899');
    var data = b('746573746D65');
    describe('HMac', function () {
        it('HMacMD5', function () {
            assert.equal(hmac(md.messageDigestType.MD5, key, data).toString('hex'), '9089d029bd7e826a9c80090725682f11');
        });
        it('HMacMD5 with key longer than block size (>64)', function () {
            assert.equal(hmac(md.messageDigestType.MD5, longKey70, data).toString('hex'), '78c2cbe8fbdf2a9ec5608b446b9d883e');
        });
        it('HMacMD5 with key equals to block size (=64)', function () {
            assert.equal(hmac(md.messageDigestType.MD5, longKey64, data).toString('hex'), '0accd14b9b46b464c6dbf8c1df3feb62');
        });
        it('HMacSHA1', function () {
            assert.equal(hmac(md.messageDigestType.SHA1, key, data).toString('hex'), '7caea159fec98c5ccd6ed215c394d8d14113c8be');
        });
        it('HMacSHA2_224', function () {
            assert.equal(hmac(md.messageDigestType.SHA2_224, key, data).toString('hex'), 'a54bd4c230b9dbd6585f4ca7e8a633749e5e85929b22ea0ce5434fdd');
        });
        it('HMacSHA2_256', function () {
            assert.equal(hmac(md.messageDigestType.SHA2_256, key, data).toString('hex'), '143275d97380ce4f8ba98e592b1ff1697d15517aa58c7fc0e245112ccdcc66fc');
        });
        it('HMacSHA2_384', function () {
            assert.equal(hmac(md.messageDigestType.SHA2_384, key, data).toString('hex'), 'e9277364d368f48de701829dc182b7a9076fc7e126a8af49ce6dcadda126e7deccb40668fe6a296a849671439b77a6de');
        });
        it('HMacSHA2_512', function () {
            assert.equal(hmac(md.messageDigestType.SHA2_512, key, data).toString('hex'), 'c8d33479fa6b3347d7904e48c8a0715cfbae890f86e2db224bbef8a3a9299fe02c6c14a5b11e85508fd7f59e5b983f3318172c805d6d274f59f868ca66ef4290');
        });
        it('HMacSHA2_512_224', function () {
        });
        it('HMacSHA2_512_256', function () {
        });
        it('HMacSHA3_224', function () {
        });
        it('HMacSHA3_256', function () {
        });
        it('HMacSHA3_384', function () {
        });
        it('HMacSHA3_512', function () {
        });
    });
});
//# sourceMappingURL=cryptolib-test.js.map