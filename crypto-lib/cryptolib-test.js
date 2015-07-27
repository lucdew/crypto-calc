var _this = this;
var cryptolibnodejs = require('./cryptolib-nodejs');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var cryptolib = cryptolibnodejs.cryptolib;
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
function padAny(pad) {
    return function (bdata, bblocksize, boptionally) {
        var result = pad(new Buffer(bdata, 'hex'), bblocksize, boptionally);
        return result ? result.toString('hex') : null;
    };
}
function unpadAny(unpad) {
    return function (bdata) {
        var result = unpad(new Buffer(bdata, 'hex'));
        return result ? result.toString('hex') : null;
    };
}
describe('Padding', function () {
    describe('pad/unpad ISO78164P', function () {
        var pad = padAny(cryptolib.padding.iso78164.pad), unpad = unpadAny(cryptolib.padding.iso78164.unpad);
        it('should pad 3 bytes', function () {
            assert.equal(pad('0102030405', 8), '0102030405800000');
        });
        it('should pad 1 bytes', function () {
            assert.equal(pad('01020304050607', 8), '0102030405060780');
        });
        it('should pad 8 bytes', function () {
            assert.equal(pad('0102030405060708', 8), '01020304050607088000000000000000');
        });
        it('should pad 3 bytes when data is greater than padding size', function () {
            assert.equal(pad('01020304050607080102030405', 8), '01020304050607080102030405800000');
        });
        it('should not padd if optional and not padding is required', function () {
            assert.equal(pad('0102030405060708', 8, true), '0102030405060708');
        });
        it('should padd if optional and padding is required', function () {
            assert.equal(pad('0102030405', 8, true), '0102030405800000');
        });
        it('should unpad 3 bytes', function () {
            assert.equal(unpad('0102030405800000'), '0102030405');
        });
        it('should unpad 1 bytes', function () {
            assert.equal(unpad('0102030405060780'), '01020304050607');
        });
        it('should unpad 8 bytes', function () {
            assert.equal(unpad('01020304050607088000000000000000'), '0102030405060708');
        });
        it('should throw when unpadding with no padding', function () {
            assertCryptoError(unpad.bind(_this, '0102030405060708'), cryptolib.error.INVALID_PADDING);
        });
        it('should throw an error if padding if data is empty', function () {
            assertCryptoError(pad.bind(_this, '', 8), cryptolib.error.INVALID_ARGUMENT);
        });
    });
    describe('pad/unpad PKCS7P', function () {
        var pad = padAny(cryptolib.padding.pkcs7.pad), unpad = unpadAny(cryptolib.padding.pkcs7.unpad);
        it('should pad 3 bytes', function () {
            assert.equal(pad('0102030405', 8), '0102030405030303');
        });
        it('should pad 1 bytes', function () {
            assert.equal(pad('01020304050607', 8), '0102030405060701');
        });
        it('should pad 8 bytes', function () {
            assert.equal(pad('0102030405060708', 8), '01020304050607080808080808080808');
        });
        it('should pad 3 bytes when data is greater than padding size', function () {
            assert.equal(pad('01020304050607080102030405', 8), '01020304050607080102030405030303');
        });
        it('should not padd if optional and not padding is required', function () {
            assert.equal(pad('0102030405060708', 8, true), '0102030405060708');
        });
        it('should padd if optional and padding is required', function () {
            assert.equal(pad('0102030405', 8, true), '0102030405030303');
        });
        it('should unpad 3 bytes', function () {
            assert.equal(unpad('0102030405030303'), '0102030405');
        });
        it('should unpad 1 bytes', function () {
            assert.equal(unpad('0102030405060701'), '01020304050607');
        });
        it('should unpad 8 bytes', function () {
            assert.equal(unpad('01020304050607080808080808080808'), '0102030405060708');
        });
        it('should throw when unpadding with no padding', function () {
            assertCryptoError(unpad.bind(_this, '0102030405060708'), cryptolib.error.INVALID_PADDING);
        });
        it('should throw an error if padding if data is empty', function () {
            assertCryptoError(pad.bind(_this, '', 8), cryptolib.error.INVALID_ARGUMENT);
        });
    });
    describe('getPaddingTypes', function () {
        it('should return list of padding types', function () {
            var result = cryptolib.padding.getAll();
            expect(result).to.have.deep.property('[0].name', 'NO_PADDING');
            expect(result).to.have.deep.property('[1].name', 'ISO_7816_4');
            expect(result).to.have.deep.property('[2].name', 'PKCS7');
        });
    });
});
describe('Cipher', function () {
    describe('getCipherAlgos', function () {
        it('should return list of cipher algo', function () {
            var result = cryptolib.cipher.cipherAlgo.getAll();
            expect(result).to.have.deep.property('[0].name', 'AES');
            expect(result).to.have.deep.property('[1].name', 'DES');
            expect(result).to.have.deep.property('[2].name', '3DES');
        });
    });
    describe('getBlockCipherModes', function () {
        it('should return list of block cipher modes', function () {
            var result = cryptolib.cipher.blockCipherMode.getAll();
            expect(result).to.have.deep.property('[0].name', 'ECB');
            expect(result).to.have.deep.property('[1].name', 'CBC');
            expect(result).to.have.deep.property('[2].name', 'CFB');
            expect(result).to.have.deep.property('[3].name', 'OFB');
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
    describe('ciphering/deciphering', function () {
        it('should final cipher data with padding', function () {
            var clearData = 'abcde';
            var key = new Buffer('01020304050607080102030405060708');
            var cipherRes = cipher.cipher(true, key, new Buffer(clearData, 'ascii'), cipher.cipherAlgo.aes, cipher.blockCipherMode.cbc, { padding: cryptolib.padding.iso78164 });
            var result = cipher.cipher(false, key, cipherRes, cipher.cipherAlgo.aes, cipher.blockCipherMode.cbc, { padding: cryptolib.padding.iso78164 });
            assert.equal(result.toString('ascii'), clearData);
        });
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
//# sourceMappingURL=cryptolib-test.js.map