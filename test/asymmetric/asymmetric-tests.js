/// <reference path="../../d.ts/mocha/mocha.d.ts"/>
/// <reference path="../../d.ts/chai/chai.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>
var assert = chai.assert;
var expect = chai.expect;
cryptolib = window.webcryptolib.cryptolib;
var rsaPrivateKeys = fixtures['asymmetric'].private.rsa;
var utf16ToHex = function (s) {
    var length = s.length;
    var index = -1;
    var result = "";
    while (++index < length) {
        result += s.charCodeAt(index).toString(16).toUpperCase();
    }
    return result;
};
describe('Load', function () {
    var createPemLoadTest = function (key, val) {
        var isEncrypted = val.match(/ENCRYPTED/i) != null;
        it("load " + key + " pem", function () {
            var rsaKey = isEncrypted ? forge.pki.decryptRsaPrivateKey(val, "cryptocalcpass") :
                forge.pki.privateKeyFromPem(val);
            assert.isNotNull(rsaKey.n);
        });
        if (isEncrypted) {
            it("load " + key + " with invalid password ", function () {
                var rsaKey = null;
                try {
                    rsaKey = forge.pki.decryptRsaPrivateKey(val, "dummy");
                }
                catch (e) {
                }
                if (null != rsaKey) {
                    assert.fail("Should have thrown exception for key " + key + "rsa key " + rsaKey);
                }
            });
        }
    };
    for (var key in rsaPrivateKeys) {
        createPemLoadTest(key, rsaPrivateKeys[key]);
    }
});
describe('Encrypt', function () {
    it('Encrypt with RAW public key', function () {
        var params = { n: "00eb6918789b2fc51ef8c5cf3ee7e472b3444b8d2b093e4b44853d3234d9f3fee8c06e5b02c88503d5f1877b992b54f9400eb88cd2556e9da88c702d37258fbb0b",
            e: "010001" };
        var key = KEYUTIL.getKey(params);
        var BigInteger = forge.jsbn.BigInteger;
        console.log(key.e.toString(16));
        console.log(key.n.toString(16));
        var exp = new BigInteger(key.e.toString(16), 16);
        var modulus = new BigInteger(key.n.toString(16), 16);
        var publicKey = forge.pki.setRsaPublicKey(modulus, exp);
        var fBuffer = forge.util.createBuffer(cryptolib.util.toArrayBuffer(new buffer.Buffer('aabbccdd', 'hex')));
        var encrypted = publicKey.encrypt(fBuffer.getBytes(), 'RSAES-PKCS1-V1_5');
        var result = forge.util.createBuffer(encrypted).toHex();
        assert.equal(result.length, 128);
    });
});
//# sourceMappingURL=asymmetric-tests.js.map