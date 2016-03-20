"use strict";
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
var webCrypto = typeof window !== 'undefined' && (window.crypto || window.msCrypto);
function generate(length) {
    if (nodejs) {
        return require('crypto').randomBytes(length);
    }
    else if (webCrypto) {
        var res = new Uint8Array(length);
        webCrypto.getRandomValues(res);
        return new Buffer(res);
    }
}
exports.generate = generate;
//# sourceMappingURL=cryptolib-random.js.map