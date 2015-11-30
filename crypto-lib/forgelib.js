/// <reference path="../d.ts/node/node.d.ts"/>
/// <reference path="./cryptolib.d.ts"/>
var util = require('./cryptolib-util');
var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
if (nodejs) {
    exports.forge = require('node-forge');
}
else {
    exports.forge = window.forge;
}
function bufferToString(buffer) {
    var res = '';
    for (var idx = 0; idx < buffer.length; idx++) {
        res += String.fromCharCode(buffer[idx]);
    }
    return res;
}
exports.bufferToString = bufferToString;
function toForgeBuffer(buffer) {
    return exports.forge.util.createBuffer(util.toArrayBuffer(buffer));
}
exports.toForgeBuffer = toForgeBuffer;
//# sourceMappingURL=forgelib.js.map