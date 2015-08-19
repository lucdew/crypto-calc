var error = require('./cryptolib-error');
var forgelib = require('./forgelib');
var cryptojslib = require('./cryptojslib');
var CryptoJS = cryptojslib.CryptoJS;
var messageDigestType = {
    MD5: { name: 'MD5', digestSize: 128, blockSize: 512, security: 64 },
    SHA1: { name: 'SHA1', digestSize: 160, blockSize: 512, security: 80 },
    SHA2_224: { name: 'SHA2_224', digestSize: 224, blockSize: 512, security: 112 },
    SHA2_256: { name: 'SHA2_256', digestSize: 256, blockSize: 512, security: 128 },
    SHA2_384: { name: 'SHA2_384', digestSize: 384, blockSize: 1024, security: 192 },
    SHA2_512: { name: 'SHA2_512', digestSize: 512, blockSize: 1024, security: 256 },
    SHA2_512_224: { name: 'SHA2_512_224', digestSize: 224, blockSize: 1024, security: 112 },
    SHA2_512_256: { name: 'SHA2_512_256', digestSize: 256, blockSize: 1024, security: 128 },
    SHA3_224: { name: 'SHA3_224', digestSize: 224, blockSize: 1152, security: 112 },
    SHA3_256: { name: 'SHA3_256', digestSize: 256, blockSize: 1088, security: 128 },
    SHA3_384: { name: 'SHA3_384', digestSize: 384, blockSize: 832, security: 192 },
    SHA3_512: { name: 'SHA3_512', digestSize: 512, blockSize: 576, security: 256 }
};
var messageDigest = {
    digest: function (messageDigest, data) {
        var word = CryptoJS.enc.Hex.parse(data.toString('hex'));
        var hash;
        if (messageDigest == messageDigestType.MD5) {
            hash = CryptoJS.MD5(word);
        }
        else if (messageDigest == messageDigestType.SHA1) {
            hash = CryptoJS.SHA1(word);
        }
        else if (messageDigest == messageDigestType.SHA2_224) {
            hash = CryptoJS.SHA224(word);
        }
        else if (messageDigest == messageDigestType.SHA2_256) {
            hash = CryptoJS.SHA256(word);
        }
        else if (messageDigest == messageDigestType.SHA2_384) {
            hash = CryptoJS.SHA384(word);
        }
        else if (messageDigest == messageDigestType.SHA2_512) {
            hash = CryptoJS.SHA512(word);
        }
        else if (messageDigest == messageDigestType.SHA2_512_224) {
            var md = forgelib.forge.sha512.sha224.create();
            md.update(forgelib.bufferToString(data));
            return new Buffer(md.digest().toHex(), 'hex');
        }
        else if (messageDigest == messageDigestType.SHA2_512_256) {
            var md = forgelib.forge.sha512.sha256.create();
            md.update(forgelib.bufferToString(data));
            return new Buffer(md.digest().toHex(), 'hex');
        }
        else if (messageDigest.name.indexOf('SHA3') == 0) {
            hash = CryptoJS.SHA3(word, { outputLength: messageDigest.digestSize });
        }
        else {
            error.raiseInvalidArg("Unsupported message digest " + messageDigest.name ? messageDigest.name : 'null');
        }
        return new Buffer(hash.toString(CryptoJS.enc.Hex), 'hex');
    },
    messageDigestType: messageDigestType
};
module.exports = messageDigest;
//# sourceMappingURL=cryptolib-message-digest.js.map