/// <reference path="./cryptolib-nodejs.ts"/>

import error = require('./cryptolib-error');
import random = require('./cryptolib-random');

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


class ZeroPadding implements Cryptolib.Padding.IPadding {
	
	name:string = "ZERO_PADDING";
	
	pad(data:Buffer,blockSize: number, optionally?:boolean) {
        return extendBuffer(data,optionally,blockSize,
            (bufferToFill:Buffer)=> {
                bufferToFill.fill(0,0,bufferToFill.length);
            });			
	}
    unpad(data:Buffer) {
        for (var i = 1;i <=data.length ;i++) {
            
            var byte = data[data.length-i];
            if (byte!==0x00) {
                return data.slice(0,data.length-i+1);
            }
        }
        return new Buffer(0);
	}
	
}


class Iso10126 implements Cryptolib.Padding.IPadding {
	
	name:string = "ISO_10126";
	
	pad(data:Buffer,blockSize: number, optionally?:boolean) {
        if (blockSize>255 || blockSize <1 ) {
           throw new error.CryptoError(error.INVALID_BLOCK_SIZE,"Cannot pad block size of "+blockSize);
        }
        return extendBuffer(data,optionally,blockSize,
            (bufferToFill:Buffer)=> { 
                var randomData = random.generate(bufferToFill.length-1);
                for (var i=0;i<randomData.length;i++) {
                    bufferToFill[i]=randomData[i];
                }                   
                bufferToFill[bufferToFill.length-1]=bufferToFill.length;
            });
        
	}
    unpad(data:Buffer) {
        var padLength = data[data.length-1];
        if ( padLength < 1 || padLength > data.length) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        return data.slice(0,data.length-padLength);
	}
	
}


class AnsiX923 implements Cryptolib.Padding.IPadding {
	
	name:string = "ANSI_X923.1";
	
	pad(data:Buffer,blockSize: number, optionally?:boolean) {
        if (blockSize>255 || blockSize <1 ) {
           throw new error.CryptoError(error.INVALID_BLOCK_SIZE,"Cannot pad block size of "+blockSize);
        }
        return extendBuffer(data,optionally,blockSize,
            (bufferToFill:Buffer)=> {                    
                bufferToFill.fill(0,0,bufferToFill.length);
                bufferToFill[bufferToFill.length-1]=bufferToFill.length;
            });
        
	}
    unpad(data:Buffer) {
        var padLength = data[data.length-1];
        if ( padLength < 1 || padLength > data.length-1) {
            throw new error.CryptoError(error.INVALID_PADDING);
        }
        for (var i = 1; i < padLength;i++) {
            
            var byte = data[data.length-1-i];
            if (byte!==0) {
                throw new error.CryptoError(error.INVALID_PADDING);
            }
            
        }
        return data.slice(0,data.length-padLength);
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
    zeroPadding: new ZeroPadding(),
    iso10126: new Iso10126(),
    ansiX923: new AnsiX923()
}

export = padding;

