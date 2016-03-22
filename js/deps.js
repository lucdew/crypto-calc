'use strict';

var buffer = require('buffer'),
    jsrsasign = require('jsrsasign'),
    CryptoJS = require('crypto-js');

if (window) {
    (function(window) {
        window.CryptoJS = CryptoJS;
        window.Buffer = buffer.Buffer;
        window.buffer = buffer;
        window.KEYUTIL=jsrsasign.KEYUTIL;
    })(window);

}

module.exports = {
    buffer: buffer,
    jsrsasign: jsrsasign,
    CryptoJS: CryptoJS
};