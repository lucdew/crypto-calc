"use strict";
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
if (nodejs) {
    exports.CryptoJS = require('crypto-js');
}
else {
    exports.CryptoJS = window.CryptoJS;
}
//# sourceMappingURL=cryptojslib.js.map