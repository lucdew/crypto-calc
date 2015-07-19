/// <reference path="./cryptolib.d.ts"/>
/// <reference path="../d.ts/node/node.d.ts"/>

import nodecrypto = require('crypto');
        
     
    export declare class Error {
        public name: string;
        public message: string;
        public stack: string;
        constructor(message?: string);
    }
		
     class CryptoError extends Error {     
    
        code : Cryptolib.Error.IErrorCode;     
        name : string;       
        message : string;
        additionalInfo: any;
    
        constructor(code:  Cryptolib.Error.IErrorCode, message? : string) {
            super(message||code.description||code.name);
            this.message = message||code.description||code.name;
            this.code = code;  
            this.name = 'CryptoError'; 
            var stack = (<any>new Error()).stack; 
            // remove one line of stack
            this.stack = stack.replace(/\n[^\n]*/,'');
        } 
    
        getCode(): Cryptolib.Error.IErrorCode {  
            return this.code; 
        } 
        toString() {
            return this.name + ': ' + this.message;
        }
    
    } 
    
    
		
		export var INVALID_ARGUMENT:Cryptolib.Error.IErrorCode = {
            value : 0, 
            name:"INVALID_ARGUMENT",
            description:"Invalid argument"};
        
        export var INVALID_PADDING:Cryptolib.Error.IErrorCode = {
            value : 1, 
            name:"INVALID_PADDING",
            description:"Invalid padding"};

        var INVALID_BLOCK_SIZE:Cryptolib.Error.IErrorCode = {
            value : 2, 
            name:"INVALID_BLOCK_SIZE",
            description:"Invalid block size"};
            
        var INVALID_KEY_SIZE:Cryptolib.Error.IErrorCode = {
            value : 3, 
            name:"INVALID_KEY_SIZE",
            description:"Invalid key size"};
            
         var PAN_MISSING:Cryptolib.Error.IErrorCode = {
            value : 4, 
            name:"PAN_MISSING",
            description:"Pan is missing"};           
            
  
		
  function raiseInvalidArg(msg:string) {
      throw new CryptoError(INVALID_ARGUMENT,msg);
  }
	
	
   function extendBuffer(data:Buffer, optionally: boolean, blockSize : number, filler: (bufferToFill:Buffer) =>  void ) {
           
            if (data.length===0){
                raiseInvalidArg('Cannot pad data of 0 length');
            }
            var remainingSize = blockSize - (data.length % blockSize);
               
            if (optionally && (remainingSize%blockSize ==0) ) {
                return data;
            }
            var paddedData = new Buffer(data.length+remainingSize);
            data.copy(paddedData,0,0,paddedData.length);
            var paddingBuffer = new Buffer(remainingSize);
            filler(paddingBuffer);
            paddingBuffer.copy(paddedData,data.length,0,paddingBuffer.length);
            return paddedData;
        
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
	
var util:Cryptolib.Util.IUtilStatic = {	
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
	                    throw new CryptoError(INVALID_PADDING);
	                }              
	            }
	             throw new CryptoError(INVALID_PADDING);
	        }   
	        
	    }
	    
	    class PKCS7Padding implements Cryptolib.Padding.IPadding {
	        
	        name:string = "PKCS7";
	        
	        pad(data:Buffer,blockSize:number,optionally=false):Buffer  {
	            if (blockSize>255 || blockSize <1 ) {
	               throw new CryptoError(INVALID_BLOCK_SIZE,"Cannot pad block size of "+blockSize);
	            }
	            return extendBuffer(data,optionally,blockSize,
	                (bufferToFill:Buffer)=> {                    
	                    bufferToFill.fill(bufferToFill.length,0,bufferToFill.length);
	                });
	            
	        }
	        unpad(data:Buffer):Buffer {
	            var nextExpected = data[data.length-1];
	            if (nextExpected > 255 || nextExpected < 1) {
	                throw new CryptoError(INVALID_PADDING);
	            }
	            for (var i = 1;i<=255 && i <= data.length;i++) {
	                
	                var byte = data[data.length-i];
	                if (byte===nextExpected && i ===nextExpected) {
	                    return data.slice(0,data.length-i);
	                }
	                else if (byte!==nextExpected) {
	                     throw new CryptoError(INVALID_PADDING);
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


var blockCipherMode : Cryptolib.Cipher.IBlockCipherModeStatic = {
        ecb :  {name:'ECB',cryptoName:'ecb',hasIV: false},
        cbc : {name:'CBC',cryptoName:'cbc',hasIV: true},
        cfb : {name:'CFB',cryptoName:'cfb',hasIV: true},
        ofb : {name:'OFB',cryptoName:'ofb',hasIV:true},
        getAll : () => { return [blockCipherMode.ecb,blockCipherMode.cbc,blockCipherMode.cfb,blockCipherMode.ofb]}
}

var cipherAlgo : Cryptolib.Cipher.ICipherAlgoStatic =  {
    
        aes : {blockSize:16,name:'AES',cryptoName:'aes',keyLengths:[128,192,256]},
        des : {blockSize:8,name:'DES',cryptoName:'des',keyLengths:[64]},
        desede :{blockSize:8,name:'3DES',cryptoName:'des-ede',keyLengths:[128,192]},
        getAll : () => { return [cipherAlgo.aes,cipherAlgo.des,cipherAlgo.desede]}
    
}


var isoPinType : Cryptolib.Pin.IIsoPinTypeStatic = {
    format0: {name: 'ISO_9564_Format_0',value: 0},
    format1: {name: 'ISO_9564_Format_1',value: 1},
    format2: {name: 'ISO_9564_Format_2',value: 2},
    format3: {name: 'ISO_9564_Format_3',value: 3},
    getAll : () => { return [isoPinType.format0,isoPinType.format1,isoPinType.format2,isoPinType.format3]}
}


function generateRandomNumberString(length:number) {
    var buffer = nodecrypto.randomBytes(length);
    var aNum ='';
    for (var i=0;i<length;i++) {
       aNum+= (buffer[i] % 10).toString();
    }
    return aNum;
}

function generateIsoPinRandomPadding(length:number) {
    
    var result ='';
    var buffer = nodecrypto.randomBytes(length);
    for (var i=0;i<length;i++) {
       result+= ((buffer[i] % 6)+10).toString(16);
    }
    return result;
}

function rightPad(aString:string,length:number,padChar:string) {
    var result = aString;
    while (result.length<length) {
        result+=padChar;
    }
    return result;
}


class IsoPin implements Cryptolib.Pin.IIsoPin {
    	    type: Cryptolib.Pin.IIsoPinType;
			pin: string;
			additionalData: string;
            
            constructor(aType: Cryptolib.Pin.IIsoPinType,aPin:string,someAdditionalData?:string) {
                if (aPin.length<1 || aPin.length>14) {
                    raiseInvalidArg("Unsupported pin length of "+aPin.length);
                }

                var paddingLength = 14 - aPin.length ;
                if (aType === isoPinType.format0 || aType === isoPinType.format3) {
                   if (!someAdditionalData || someAdditionalData.length!=12 ) {
                        raiseInvalidArg("Pan is missing or not of 12 chars length,  it shall be provided for type "+aType);
                   }
                }
                else if ( aType === isoPinType.format1) {
                      if (!someAdditionalData ) { // pad with random number
                          someAdditionalData= generateRandomNumberString(paddingLength);
                      }
                      if (someAdditionalData.length < paddingLength) {
                        raiseInvalidArg("Not enough additional data (pan or transaction id) for pin type"+aType);
                      }
                      if (someAdditionalData.length > paddingLength) {
                           someAdditionalData=someAdditionalData.substring(0,paddingLength);
                      }
                     
                }
                else {
                    if (someAdditionalData) {
                        raiseInvalidArg("Unexpected additional data for pin type"+aType);
                    }
                    
                }
                this.type = aType;
                this.pin = aPin;
                this.additionalData = someAdditionalData;
  
            }
            
            
			toBlock() : Buffer {
                
                var tl = this.type.value.toString()+this.pin.length.toString(16);
                
                if (this.type.value===1) {
                   return new Buffer(tl+this.pin+this.additionalData,'hex');
                }
                else if (this.type.value===2) {
                  var paddedPin = tl+this.pin;
                  paddedPin = rightPad(paddedPin,16,'F');
                  return new Buffer(paddedPin,'hex'); 
                }
                else if (this.type.value === 0 || this.type.value===3) {
                   var paddedPin = tl+this.pin;
                   var paddingLength = 14-this.pin.length;
                   if (this.type.value ===3) {
                      paddedPin += generateIsoPinRandomPadding(paddingLength);
                   }
                   else {
                      paddedPin = rightPad(paddedPin,16,'F'); 
                   }

                   var paddedPan = '0000'+this.additionalData;
                   return util.xor(new Buffer(paddedPin,'hex'),
                       new Buffer(paddedPan,'hex'));
                }
                
                
                raiseInvalidArg('unsupport pin type with value '+this.type.value);
            
            }
            
            
            static  parseIsoPinBlock(block:Buffer,pan?:string):Cryptolib.Pin.IIsoPin {
                if (block.length!==8) {
                    raiseInvalidArg('Invalid pin block size, must be 8 bytes');
                }
                var blockHex = block.toString('hex');
                var type:Cryptolib.Pin.IIsoPinType = null;
                var allPinTypes = isoPinType.getAll();
                for (var idx=0;idx<allPinTypes.length;idx++) {
                    if (allPinTypes[idx].value.toString()===blockHex.substring(0,1)) {
                        type = allPinTypes[idx];
                        break;
                    }
                }
                if (!type) {
                    raiseInvalidArg('Unsupported type '+blockHex.substring(0,1));
                }
                var pinLength = 0;
                try {
                   pinLength=parseInt(blockHex.substring(1,2),16); 
                } 
                catch(e) {
                    raiseInvalidArg('Invalid pin length');
                }
                
                if (type.value===0 || type.value ===3 ) {
                   if (!pan) {
                        var e:CryptoError=  new CryptoError(PAN_MISSING,'Pan is missing');
                        e.additionalInfo= {pinLength:pinLength,pinType:type};
                        throw e;
                   }
                   var paddedPan = '0000'+pan;
                   var xoredPin = util.xor(block,
                       new Buffer(paddedPan,'hex'));
                   return new IsoPin(type,xoredPin.toString('hex').substring(2,2+pinLength),pan);
                    
                }
                else  {
                    return new IsoPin(type,block.toString('hex').substring(2,2+pinLength));
                }

            }
}


var pin:Cryptolib.Pin.IPinStatic = {
    
    
    createIsoPin: function(isoPinType:Cryptolib.Pin.IIsoPinType,pin:string,additionalData?:string) {
        return new IsoPin(isoPinType,pin,additionalData);
        
    },
	createIsoPinFromBlock: function(block:Buffer,pan?:string){
        return IsoPin.parseIsoPinBlock(block,pan);
    },
    isoPinType : isoPinType
    
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


function mod10ComputeCheckDigit(apan:string) {
    var sum = 0 ;
    apan.split('').reverse().forEach(function(value,index) {
        if (index % 2 ===0) {
            var doubledDigit = parseInt(value,10)*2;
            sum += (doubledDigit>9?(doubledDigit-9):doubledDigit);
        }
        else {
            sum+=parseInt(value,10);
        }

    });
    var sumMod10 = sum %10;
    return sumMod10===0 ? '0': (10 - sumMod10).toString();
}


class Pan implements Cryptolib.Banking.IPan {
    
    private rawValue: string;
	issuerIdentificationNumber:string;
	majorIndustryIdentifer:string;
	individualAccountIdentifier: string;
    bankIdentificationNumber:string;
	
	checkDigit: string;
	issuingNetwork:Cryptolib.Banking.IIssuingNetwork;
    
    constructor() {
        
    }
	formatForIso9564Pin():string {
        
        var last13Digits = takeLast(this.rawValue,13);
        return last13Digits.substring(0,12);
    }	
    
    isValid() : boolean {
        return mod10ComputeCheckDigit(this.rawValue.substring(0,this.rawValue.length-1)) === this.rawValue.substring(this.rawValue.length-1);
    }  
    
    static fromString(pan:string):Pan {
        var aPan = new Pan();
        aPan.issuerIdentificationNumber= pan.substring(0,6);
        aPan.majorIndustryIdentifer = pan.substring(0,1);
        aPan.bankIdentificationNumber = aPan.issuerIdentificationNumber;
        var panWithoutIssuer = pan.substring(6);
        aPan.individualAccountIdentifier = panWithoutIssuer.substring(0,panWithoutIssuer.length-1);
        aPan.checkDigit=pan.substring(pan.length-1);
        aPan.rawValue = pan;
        var allNetworks = issuingNetwork.getAll();
        for (var i=0;i<allNetworks.length;i++) {
            if (allNetworks[i].iinRegexp.test(pan)) {
                var exclusions:RegExp[]=allNetworks[i].exclusions;
                var excluded:boolean = false;
                for (var j=0;exclusions && j < exclusions.length && !excluded;j++) {
                   excluded = exclusions[j].test(pan);
                }
               if (!excluded) {
                   aPan.issuingNetwork = allNetworks[i];
                   break;
               }
               
            }
        };
        if (! aPan.issuingNetwork) {
            raiseInvalidArg('PAN is not issued')
        }
        
        return aPan;
    }
}

var issuingNetwork: Cryptolib.Banking.IIssuingNetworkStatic = {
           	Amex:{
                name:'American Express',
    			iinRegexp: /^3[47]\d{13}$/,
    			active: true,
    			lengths: {
                    min:15,
                    max:15
                }
            },
			Bankcard:{
                name:'Bankcard',
                iinRegexp: /^(5610\d{12}|56022[1-5]\d{10})$/,
                active:false,
                lengths:{
                    min:16,
                    max:16
                }       
            },
			ChinaUnionPay:{
                name : 'China UnionPay',
                iinRegexp: /^62\d{14,17}$/,
                active: true,
                lengths:{
                    min:16,
                    max:19
                }
            
            },
			DinersClubCarteBlanche: {
                name : 'Diners Club Carte Blanche',
                iinRegexp: /^30[0-5]\d{11}$/,
                active: true,
                lengths:{
                    min:14,
                    max:14
                }    
            },
			DinersClubEnRoute: {
                name : 'Diners Club En Route',
                iinRegexp: /^(2014|2149)\d{11}$/,
                active: false,
                lengths:{
                    min:15,
                    max:15
                }                 
            },
			DinersClubInternational: {
                name : 'Diners Club International',
                iinRegexp: /^(30[0-5]\d{11}|309\d{11}|36\d{12}|3[8-9]\d{12})$/,
                active: true,
                lengths:{
                    min:14,
                    max:14
                }                
            },
            // Commented out overlap with Mastercard
            // see: https://github.com/PawelDecowski/jquery-creditcardvalidator/issues/2
			/*DinersClubUsCanada: {
                name : 'Diners Club United States & Canada',
                iinRegexp: /^5[4-5]\d{14}$/,
                active: true,
                lengths:{
                    min:16,
                    max:16
                }    
            },*/
			DiscoverCard: {
                name : 'Discover Card',
                iinRegexp: /^(6011\d{12}|62212[6-9]\d{10}|6221[3-9][0-9]\d{10}|622[3-8][0-9][0-9]\d{10}|6229[01][0-9]\d{10}|62292[0-5]\d{10}|64[4-9]\d{13}|65\d{14})$/,
                active: true,
                lengths:{
                    min:16,
                    max:16
                }           
            },
			InterPayment: {
                name : 'InterPayment',
                iinRegexp: /^636\d{13,16}$/,
                active: true,
                lengths:{
                    min:16,
                    max:19
                }
            },
			InstaPayment: {
                name : 'InstaPayment',
                iinRegexp: /^63[7-9]\d{13,16}$/,
                active: true,
                lengths:{
                    min:16,
                    max:19
                }               
            },
			JCB : {
                name : 'JCB',
                iinRegexp: /^(352[8-9]{12}|35[3-8][0-9]\d{12})$/,
                active: true,
                lengths:{
                    min:16,
                    max:16
                }              
            },
			Laser: {
                name : 'Laser',
                iinRegexp: /^(6304\d{12,15}|6706\d{12,15}|6771\d{12,15}|6709\d{12,15})$/,
                active: false,
                lengths:{
                    min:16,
                    max:19
                }                      
            },
			Maestro : {
                name : 'Maestro',
                iinRegexp: /^(50[0-9][0-9][0-9][0-9]\d{6,13}|5[6-9][0-9][0-9][0-9][0-9]\d{6,13}|6[0-9][0-9][0-9][0-9][0-9]\d{6,13})$/,
                active: true,
                exclusions: [
                    /^60110[0-9]\d{6,13}$/, 
                    /^6011[234][0-9]\d{6,13}$/,
                    /^601174\d{6,13}$/,
                    /^60117[7-9]\d{6,13}$/,
                    /^(60118[6-9]\d{6,13}|60119[0-9]\d{6,13})$/,
                    /^64[4-9][0-9][0-9][0-9]\d{6,13}$/,
                    /^65[0-9][0-9][0-9][0-9]\d{6,13}$/
                ],
                lengths:{
                    min:12,
                    max:19
                }               
            },
			Dankort : {
                name : 'Dankort',
                iinRegexp: /^5019\d{12}$/,
                active: false,
                lengths:{
                    min:16,
                    max:16
                }                
             
            },
			MasterCardNotActive: {
                name : 'Mastercard',
                iinRegexp: /^(222[1-9][0-9][0-9]\d{10}|22[3-6][0-9][0-9][0-9]\d{10}|227[0-1][0-9][0-9]\d{10}|22720[0-9][0-9]\d{10})$/,
                active: false,
                lengths:{
                    min:16,
                    max:16
                }                   
            
            },
			MasterCard: {
                name : 'MasterCard',
                iinRegexp: /^5[1-5]\d{14}$/,
                active: true,
                lengths:{
                    min:16,
                    max:16
                }        
            },
			Solo : {
                name : 'Solo',
                iinRegexp: /^6334-6767\d{12,15}$/,
                active: false,
                lengths:{
                    min:16,
                    max:19
                }                 
                
            },
			Switch: {
                name : 'Switch',
                iinRegexp: /^(4903\d{12,15}|4905\d{12,15}|4911\d{12,15}|4936\d{12,15}|564182\d{10,13}|633110\d{10,13}|6333\d{12,15}|6759\d{12,15})$/,
                active: false,
                lengths:{
                    min:16,
                    max:19
                }                 
                
            },
			Visa : {
                name : 'Visa',
                iinRegexp: /^4\d{12,15}$/,
                active: true,
                lengths:{
                    min:13,
                    max:16
                }                
            },
			UATP : {
                name : 'UATP',
                iinRegexp: /^1\d{14}$/,
                active: true,
                lengths:{
                    min:15,
                    max:15
                }                 
                
            },
			getAll: function() {
                return [
                    issuingNetwork.Amex,
                    issuingNetwork.Bankcard,
                    issuingNetwork.ChinaUnionPay,
                    issuingNetwork.Dankort,
                    issuingNetwork.DinersClubEnRoute,
                    issuingNetwork.DinersClubInternational,
                    issuingNetwork.DiscoverCard,
                    issuingNetwork.MasterCard,
                    issuingNetwork.InstaPayment,
                    issuingNetwork.InterPayment,
                    issuingNetwork.JCB,
                    issuingNetwork.Laser,
                    issuingNetwork.Maestro,
                    issuingNetwork.MasterCard,
                    issuingNetwork.MasterCardNotActive,
                    issuingNetwork.Solo,
                    issuingNetwork.Switch,
                    issuingNetwork.UATP,
                    issuingNetwork.Visa
                   
                ]
            }   
};

var banking:Cryptolib.Banking.IBankingStatic = {
    createPanFromString: function(pan:string) {
        return Pan.fromString(pan);
    },
    computeCheckDigit: function(pan:string) {
        return mod10ComputeCheckDigit(pan);
    },
    issuingNetwork: issuingNetwork
}

class Cipher implements Cryptolib.Cipher.ICipher {
    
        private key : Buffer;
        private iv : Buffer;
        private cipherAlgo:Cryptolib.Cipher.ICipherAlgo;
        private blockCipherMode:Cryptolib.Cipher.IBlockCipherMode;
		private padding:Cryptolib.Padding.IPadding;
        private cipher:nodecrypto.Cipher;
        private dataCount:number=0;
        private cipherMode : boolean;
        
    
        constructor(aCipherAlgo:Cryptolib.Cipher.ICipherAlgo,
                    aBlockCipherMode:Cryptolib.Cipher.IBlockCipherMode,
		            aPadding:Cryptolib.Padding.IPadding) {
                        this.cipherAlgo = aCipherAlgo;
                        this.blockCipherMode=aBlockCipherMode;
                        this.padding = aPadding;
                        
                    }
        
    	init(key:Buffer,cipherMode:boolean,iv?:Buffer) {  
           this.cipherMode = cipherMode;
           
           if (!iv) {
               iv = this.genNullIv(this.blockCipherMode.hasIV?this.cipherAlgo.blockSize:0);
           }
           if (cipherMode) {
                this.cipher = nodecrypto.createCipheriv(this.getSymCryptoAlgorithm(key),key,iv);
                
           }
           else {
               this.cipher = nodecrypto.createDecipheriv(this.getSymCryptoAlgorithm(key),key,iv);
           }
          
           this.cipher.setAutoPadding(false);

        }
        
        genNullIv(length:number):Buffer {
            var iv = new Buffer(length);
            iv.fill(0);
            return iv;
        }
        
	    update(data:Buffer) {
            this.dataCount += data.length;
            return this.cipher.update(data);
            
        }
		finish(data?:Buffer):Buffer {       
            
           
            if (this.cipherMode) {
               var dataToProcess:Buffer;
               if (data) {
                dataToProcess = this.padding.pad(data,this.cipherAlgo.blockSize);
               }
               else {
                    var toPadSize = this.cipherAlgo.blockSize - (this.dataCount % this.cipherAlgo.blockSize);
                    dataToProcess = this.padding.pad(new Buffer(""),this.cipherAlgo.blockSize);       
               }
               return Buffer.concat([this.cipher.update(dataToProcess),this.cipher.final()]);
                
            }
            else {
               
               if (data) {
                   var paddedData:Buffer = this.cipher.update(data);
                    return this.padding.unpad(paddedData);
               }
               else {
                   // no unpadding in this case
                    return this.cipher.final();     
               }
                
            }
            

           
            
        }
        
        getSymCryptoAlgorithm(key:Buffer) {
        
            var algo = this.cipherAlgo.cryptoName;
            if (this.cipherAlgo===cipherAlgo.desede && key.length===192) {
                algo +='3'; // DESEDE with triple keys
            }
            else if (this.cipherAlgo===cipherAlgo.aes ){
               algo+= '-'+key.length*8;
            }
            if (this.blockCipherMode===blockCipherMode.ecb && this.cipherAlgo!==cipherAlgo.aes) {
                return algo;
            }
            algo+='-';
            algo+=this.blockCipherMode.cryptoName;
            
            return algo;
            
        }
    
}


function computeKcv(key:Buffer,cipherAlgo:Cryptolib.Cipher.ICipherAlgo,length?:number): string {
    if (length && length > cipherAlgo.blockSize) {
        raiseInvalidArg(`Invalid KCV length ${length} must be lower or equal than ${cipherAlgo.blockSize}`);
    }

          
    var data = new Buffer(cipherAlgo.blockSize);
    data.fill(0);
    var cipher = new Cipher(cipherAlgo,blockCipherMode.ecb,padding.noPadding);
    cipher.init(key,true);

    var result = util.toHex(cipher.finish(data));
    return length? result.substr(0,length*2):result;  
}

var cipher:Cryptolib.Cipher.ICipherStatic = {
	cipherAlgo : cipherAlgo,
	blockCipherMode: blockCipherMode,
	createCipher:function (cipherAlgo:Cryptolib.Cipher.ICipherAlgo,blockCipherMode:Cryptolib.Cipher.IBlockCipherMode,
		padding:Cryptolib.Padding.IPadding) {
		return new Cipher(cipherAlgo,blockCipherMode,padding);
	},
    computeKcv: computeKcv
}


export var cryptolib:Cryptolib.CryptoLibStatic = {
	cipher: cipher,
    padding: padding,
    error :  {
        CryptoError: CryptoError,
        INVALID_ARGUMENT:INVALID_ARGUMENT,
		INVALID_PADDING:INVALID_PADDING ,
        INVALID_BLOCK_SIZE:INVALID_BLOCK_SIZE,
        INVALID_KEY_SIZE:INVALID_KEY_SIZE,
        PAN_MISSING:PAN_MISSING
        
    },
    util : util,
    pin : pin,
    banking:banking
    
};




	

