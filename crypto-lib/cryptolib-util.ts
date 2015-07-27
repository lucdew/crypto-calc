/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>

import random = require('./cryptolib-random');

function generateRandomNumberString(length:number) {
    var buffer = random.generate(length);
    var aNum ='';
    for (var i=0;i<length;i++) {
       aNum+= (buffer[i] % 10).toString();
    }
    return aNum;
}

function bitwiseBuffers(a:Buffer,b:Buffer,bitwiseOperation: (aNum:number,bNum:number)=>number) {
      var res:number[] = []
      if (a.length > b.length) {
        for (var i = 0; i < b.length; i++) {
          res.push(bitwiseOperation(a[i],b[i]));
        }
       } else {
        for (var i = 0; i < a.length; i++) {
          res.push(bitwiseOperation(a[i],b[i]));
        }
      }
      return new Buffer(res);
}	

function rightPad(aString:string,length:number,padChar:string) {
    var result = aString;
    while (result.length<length) {
        result+=padChar;
    }
    return result;
}


function leftPad(aString:string,n:number,padChar:string):string {
    if (aString.length >=n) {
        return aString;
    }
    else {
        var paddedString = aString;
        while(paddedString.length !== n) {
            paddedString=padChar + paddedString;
        }
    }
}

function takeLast(aString:string,n:number) {
    if (aString.length > n) {
        return aString.substring(aString.length-n);
    }
    else {
        if (aString.length < n ) {
            return leftPad(aString,n,'0');
        }
        else {
            return aString;
        }
    }
}


var util:Cryptolib.Util.IUtilStatic = {	
    takeLast: takeLast,
    leftPad : leftPad,
    rightPad: rightPad,
    generateRandomNumberString: generateRandomNumberString,
	createBuffer(data:string,encoding:string) {
		return new Buffer(data,encoding);
	},
    toHex: function(data:Buffer) {
        return data.toString('hex').toUpperCase();
    },
    fromHex: function(data:string) {
        return new Buffer(data,'hex');
    },
    xor : function(a:Buffer,b:Buffer) {
          return bitwiseBuffers(a,b,(aNum,bNum) => aNum ^ bNum);
    },
    and :  function(a:Buffer,b:Buffer) {
          return bitwiseBuffers(a,b,(aNum,bNum) => aNum & bNum);
    },
    or :  function(a:Buffer,b:Buffer) {
          return bitwiseBuffers(a,b,(aNum,bNum) => aNum | bNum);
    },
    not :  function(a:Buffer) {
         var res:number[] =[];
         for (var i = 0; i < a.length; i++) {
              res.push(~a[i]);
         }
         return new Buffer(res);
    }
}

export = util;	
