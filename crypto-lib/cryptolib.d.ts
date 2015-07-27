/// <reference path="../d.ts/node/node.d.ts"/>


declare module Cryptolib {
	
    module Error {
		interface IErrorCode {
	        name:string;
	        value:number;
	        description?:string;   
        }


	    export class CryptoError  {      
	        code : IErrorCode;     
	        name : string;       
	        message : string;
			additionalInfo : any;
	    }
		
		interface CryptoErrorStatic {
			new(code:  Cryptolib.Error.IErrorCode, message? : string): CryptoError;
		}
		
		interface ErrorStatic {
			CryptoError: CryptoErrorStatic ;
			INVALID_ARGUMENT:IErrorCode;
			INVALID_PADDING:IErrorCode ;
            INVALID_BLOCK_SIZE:IErrorCode; 
            INVALID_KEY_SIZE:IErrorCode;
			PAN_MISSING:IErrorCode;
			
		}
		
		
			
		
	}

	
    module Random {
	    interface IRandomStatic {		
			generate(length:number):Buffer;
		}		
	}
		
	
	module Util {
		interface Buffer {
		  [index: number]: number;
		    write(string: string, offset?: number, length?: number, encoding?: string): number;
		    toString(encoding?: string, start?: number, end?: number): string;
		    toJSON(): any;
		    length: number;
		    equals(otherBuffer: Buffer): boolean;
		    compare(otherBuffer: Buffer): number;
		    copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
		    slice(start?: number, end?: number): Buffer;
		    writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
		    writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
		    writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
		    writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;
		    readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
		    readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
		    readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;
		    readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;
		    readUInt8(offset: number, noAsset?: boolean): number;
		    readUInt16LE(offset: number, noAssert?: boolean): number;
		    readUInt16BE(offset: number, noAssert?: boolean): number;
		    readUInt32LE(offset: number, noAssert?: boolean): number;
		    readUInt32BE(offset: number, noAssert?: boolean): number;
		    readInt8(offset: number, noAssert?: boolean): number;
		    readInt16LE(offset: number, noAssert?: boolean): number;
		    readInt16BE(offset: number, noAssert?: boolean): number;
		    readInt32LE(offset: number, noAssert?: boolean): number;
		    readInt32BE(offset: number, noAssert?: boolean): number;
		    readFloatLE(offset: number, noAssert?: boolean): number;
		    readFloatBE(offset: number, noAssert?: boolean): number;
		    readDoubleLE(offset: number, noAssert?: boolean): number;
		    readDoubleBE(offset: number, noAssert?: boolean): number;
		    writeUInt8(value: number, offset: number, noAssert?: boolean): void;
		    writeUInt16LE(value: number, offset: number, noAssert?: boolean): void;
		    writeUInt16BE(value: number, offset: number, noAssert?: boolean): void;
		    writeUInt32LE(value: number, offset: number, noAssert?: boolean): void;
		    writeUInt32BE(value: number, offset: number, noAssert?: boolean): void;
		    writeInt8(value: number, offset: number, noAssert?: boolean): void;
		    writeInt16LE(value: number, offset: number, noAssert?: boolean): void;
		    writeInt16BE(value: number, offset: number, noAssert?: boolean): void;
		    writeInt32LE(value: number, offset: number, noAssert?: boolean): void;
		    writeInt32BE(value: number, offset: number, noAssert?: boolean): void;
		    writeFloatLE(value: number, offset: number, noAssert?: boolean): void;
		    writeFloatBE(value: number, offset: number, noAssert?: boolean): void;
		    writeDoubleLE(value: number, offset: number, noAssert?: boolean): void;
		    writeDoubleBE(value: number, offset: number, noAssert?: boolean): void;
		    fill(value: any, offset?: number, end?: number): void;
	     }
		 
		 interface IUtilStatic {
			 createBuffer(data:string,encoding:string):Buffer;
			 leftPad(aString:string,n:number,padChar:string):string;
			 rightPad(aString:string,n:number,padChar:string):string;
			 takeLast(aString:string,n:number):string;
			 generateRandomNumberString(length:number):string;
			 fromHex(data:string):Buffer;
			 toHex(data:Buffer):string;
			 xor(a:Buffer,b:Buffer):Buffer;
			 or(a:Buffer,b:Buffer):Buffer;
			 and(a:Buffer,b:Buffer):Buffer;
			 not(a:Buffer):Buffer;
			 
		 }
	
		
	}
	
	module Banking {
		
		interface IIssuingNetwork {
			name:string;
			iinRegexp: RegExp;
			active: boolean;
			lengths: {
				min:number;
				max:number;
			};
			exclusions?: [RegExp];
		}
		
		interface IIssuingNetworkStatic {
			Amex:IIssuingNetwork;
			Bankcard:IIssuingNetwork;
			ChinaUnionPay:IIssuingNetwork;
			DinersClubCarteBlanche: IIssuingNetwork;
			DinersClubEnRoute: IIssuingNetwork;
			DinersClubInternational: IIssuingNetwork;
			// see: https://github.com/PawelDecowski/jquery-creditcardvalidator/issues/2
			//DinersClubUsCanada: IIssuingNetwork;
			DiscoverCard: IIssuingNetwork;
			InterPayment: IIssuingNetwork;
			InstaPayment: IIssuingNetwork;
			JCB : IIssuingNetwork;
			Laser: IIssuingNetwork;
			Maestro : IIssuingNetwork;
			Dankort : IIssuingNetwork;
			MasterCardNotActive: IIssuingNetwork;
			MasterCard: IIssuingNetwork;
			Solo : IIssuingNetwork;
			Switch: IIssuingNetwork;
			Visa : IIssuingNetwork;
			UATP : IIssuingNetwork;
			getAll() : IIssuingNetwork[]
			
		}
		
		interface IPan {
			issuerIdentificationNumber:string;
			majorIndustryIdentifer:string;
			individualAccountIdentifier: string;
			isValid() : boolean;
			checkDigit: string;
			issuingNetwork:IIssuingNetwork;
			formatForIso9564Pin():string;			
		}
		
		interface IBankingStatic {		
			createPanFromString(pan:string):IPan;
			computeCheckDigit(pan:string):string;
			issuingNetwork: IIssuingNetworkStatic;
		}
		
	}
	
	
	module Pin {
		
	    interface IIsoPinTypeStatic {
			format0: IIsoPinType;
			format1: IIsoPinType;
			format2: IIsoPinType;
			format3: IIsoPinType;
			getAll(): IIsoPinType[];
		}
		
		interface IIsoPinType {
			name: string;
			value: number;
		}

		interface IIsoPin {
			type: IIsoPinType;
			pin: string;
			additionalData: string;
			toBlock() : Buffer;
		}
		
		interface IPinStatic {
		    createIsoPin(isoPinType:IIsoPinType,pin:string,additionalData?:string):IIsoPin;
			createIsoPinFromBlock(block:Buffer,pan?:string):IIsoPin;
			isoPinType : IIsoPinTypeStatic;
		}
	}
	
	
	module Padding {
		    interface IPaddingStatic {
				noPadding: IPadding;
				iso78164: IPadding;
				pkcs7: IPadding;	
				getAll(): IPadding[];
    
            }
			
			interface IPadding {
                name:string;
                pad(data:Util.Buffer,blockSize: number, optionally?:boolean): Util.Buffer;
                unpad(data:Util.Buffer) : Util.Buffer;
            } 
		
	}
	
	module Cipher {
		
		
	    interface ICipherAlgo {
	        blockSize: number;
	        name : string ;
	        cryptoName : string;
	        keyLengths?:number[]; 
	    }
		
   
	    interface IBlockCipherMode {
	        name:string;
	        hasIV: boolean;
	        cryptoName:string;       
	    }
	    
	    interface ICipherAlgoStatic  {
	        aes: ICipherAlgo;
			des: ICipherAlgo;
			desede: ICipherAlgo;
			getAll(): ICipherAlgo[]; 	              
	    }

	    interface IBlockCipherModeStatic  {
	        cbc: IBlockCipherMode;
			ecb: IBlockCipherMode;
			cfb: IBlockCipherMode;	
			ofb:IBlockCipherMode;
		    getAll(): IBlockCipherMode[];            
	    }
		
		interface ICipherOptions {
			iv?:Buffer;
			padding?: Padding.IPadding;			
		}
		
		
		interface ICipherStatic {
			cipherAlgo: ICipherAlgoStatic;
			blockCipherMode : IBlockCipherModeStatic;
			cipher(cipherMode:boolean,key:Buffer,data:Buffer,cipherAlgo:ICipherAlgo,blockCipherMode:IBlockCipherMode,cipherOpts?:ICipherOptions):Buffer;
			computeKcv(key:Buffer,cipherAlgo:ICipherAlgo,length?:number):string;
		}
		
	}

	
	
	interface CryptoLibStatic {
		cipher: Cipher.ICipherStatic;
		padding: Padding.IPaddingStatic;
		util : Util.IUtilStatic;
		error : Error.ErrorStatic;
		pin: Pin.IPinStatic;
		banking:Banking.IBankingStatic;
		random: Random.IRandomStatic;
	}
	
	
}


declare var cryptolib : Cryptolib.CryptoLibStatic;




	
