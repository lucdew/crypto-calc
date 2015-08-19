/// <reference path="../d.ts/node/node.d.ts"/>

var nodejs = ( typeof process !== 'undefined' && process.versions && process.versions.node);
export var CryptoJS:any;
if (nodejs) {
   CryptoJS = require('crypto-js');
}
else {
    CryptoJS = (<any>window).CryptoJS;
}


