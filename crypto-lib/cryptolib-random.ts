/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>

var nodejs = ( typeof process !== 'undefined' && process.versions && process.versions.node);

var webCrypto = typeof window !== 'undefined' && ((<any>window).crypto || (<any>window).msCrypto);


export function generate(length:number) {
	  if (nodejs) {
		  return require('crypto').randomBytes(length);
	  }
	  else if (webCrypto) {
		  var res = new Uint8Array(length);
		  webCrypto.getRandomValues(res);
		  return new Buffer(res);
	  }
	  
}