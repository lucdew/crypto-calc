/// <reference path="./cryptolib.d.ts"/>

import util = require('./cryptolib-util');

var nodejs = (typeof process !== 'undefined' && process.versions && process.versions.node);
export var forge: any;
if (nodejs) {
    forge = require('node-forge');
} else {
    forge = ( < any > window).forge;
}

export function bufferToString(buffer: Buffer) {
    var res = '';

    for (var idx = 0; idx < buffer.length; idx++) {
        res += String.fromCharCode(buffer[idx]);
    }

    return res;
}

export function toForgeBuffer(buffer: Buffer) {
    return forge.util.createBuffer(util.toArrayBuffer(buffer));
    //return new forge.util.DataBuffer(toArrayBuffer(buffer));
}