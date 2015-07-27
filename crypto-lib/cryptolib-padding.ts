/// <reference path="./cryptolib-nodejs.ts"/>

import error = require('./cryptolib-error');

function extendBuffer(data:Buffer, optionally: boolean, blockSize : number, filler: (bufferToFill:Buffer) =>  void ) {
       
        if (data.length===0){
            error.raiseInvalidArg('Cannot pad data of 0 length');
        }
        var remainingSize = blockSize - (data.length % blockSize);
           
        if (optionally && (remainingSize%blockSize ==0) ) {
            return data;
        }
        var paddedData = new Buffer(data.length+remainingSize);
        data.copy(paddedData,0,0,data.length);
        var paddingBuffer = new Buffer(remainingSize);
        filler(paddingBuffer);
        paddingBuffer.copy(paddedData,data.length,0,paddingBuffer.length);
        return paddedData;
    
}

class NoPadding implements Cryptolib.Padding.IPadding {
	
	name:string = "NO_PADDING";
	
	pad(data:Buffer,blockSize: number, optionally?:boolean) {
		return data;			
	}
    unpad(data:Buffer) {
		return data;
	}
	
}
			
class Iso78164Padding implements Cryptolib.Padding.IPadding {
    
	name:string = "ISO_7816_4";
    
    pad(data:Buffer,blockSize:number,optionally=false):Buffer  {
        return extendBuffer(data,optionally,blockSize,
            (bufferToFill:Buffer)=> {
                bufferToFill.write("80",0,1,"hex");
                bufferToFill.fill(0,1,bufferToFill.length);
            });
        
    }
    
    unpad(data:Buffer):Buffer {
        for (var i = 1;i <=data.length ;i++) {
            
            var byte = data[data.length-i];
            if (byte===0x80) {
                return data.slice(0,data.length-i);
            }
            else if (byte!==0) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }              
        }
         throw new error.CryptoError(error.INVALID_PADDING);
    }   
    
}
	    
class PKCS7Padding implements Cryptolib.Padding.IPadding {
    
    name:string = "PKCS7";
    
    pad(data:Buffer,blockSize:number,optionally=false):Buffer  {
        if (blockSize>255 || blockSize <1 ) {
           throw new error.CryptoError(error.INVALID_BLOCK_SIZE,"Cannot pad block size of "+blockSize);
        }
        return extendBuffer(data,optionally,blockSize,
            (bufferToFill:Buffer)=> {                    
                bufferToFill.fill(bufferToFill.length,0,bufferToFill.length);
            });
        
    }
    unpad(data:Buffer):Buffer {
        var nextExpected = data[data.length-1];
        if (nextExpected > 255 || nextExpected < 1) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        for (var i = 1;i<=255 && i <= data.length;i++) {
            
            var byte = data[data.length-i];
            if (byte===nextExpected && i ===nextExpected) {
                return data.slice(0,data.length-i);
            }
            else if (byte!==nextExpected) {
                 throw new error.CryptoError(error.INVALID_PADDING);
            }
        }
        
    }     
    
}

var padding: Cryptolib.Padding.IPaddingStatic = {	
	noPadding : new NoPadding(),
	pkcs7 : new PKCS7Padding(),
	iso78164: new Iso78164Padding(),
	getAll : () => {
		return [padding.noPadding,padding.iso78164,padding.pkcs7];
	}
}

export = padding;

