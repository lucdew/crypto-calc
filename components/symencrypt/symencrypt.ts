/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

var symEncryptModule = angular.module('CryptoCalcModule.symencrypt', ['CryptoCalcModule.common']);


symEncryptModule.controller('SymencryptController',['$timeout','cryptolib','CryptoCalc',SymencryptController])


function SymencryptController($timeout:angular.ITimeoutService,cryptolib:Cryptolib.CryptoLibStatic,CryptoCalc:any) {
	
	this.model=CryptoCalc.encrypt;
	
	$timeout(() => {
		
		this.cipherAlgos=cryptolib.cipher.cipherAlgo.getAll();
		this.blockCipherModes=cryptolib.cipher.blockCipherMode.getAll();
		this.blockCipherMode=this['blockCipherModes'][0];
		this.paddingTypes=cryptolib.padding.getAll();
		this.padding=this['paddingTypes'][0];
		
	});
	
	this.setCipherAlgo=function(cipherAlgo:Cryptolib.Cipher.ICipherAlgo) {
		this.cipherAlgo = cipherAlgo;
		this.errors['cipherAlgo']=null;
	}
	
    this.setBlockCipherMode=function(blockCipherMode:Cryptolib.Cipher.IBlockCipherMode) {
		this.blockCipherMode = blockCipherMode;
		if (this.cipherAlgo) {
			this.iv=Array(2*(<Cryptolib.Cipher.ICipherAlgo>this.cipherAlgo).blockSize+1).join("0");
		}
	}
	
   this.setPaddingType=function(paddingType:string) {
		this.padding = paddingType;
	}
	
	
	this.setFieldError=function(fieldName:string,msg:string) {
		this.errors[fieldName] = msg;
		//this.form[fieldName].$setValidity('server',false);
		console.log('######### Error '+fieldName+', msg:'+msg);
	}
	
	this.isValidForm=function(cipherMode:boolean):boolean {
		this.errors = {};
		if (! this.data) {
			this.setFieldError('data','Missing data');
		}
		else if (this.data.length % 2 !==0 ) {
			this.setFieldError('data','Invalid hexa data');
		}
		
		if (! this.key) {
			this.setFieldError('key','Missing key');
		}
		else if (this.cipherAlgo &&  this.cipherAlgo.keyLengths.indexOf(this.key.length*4)===-1) {
			this.setFieldError('key','Invalid key length only accepted are '+JSON.stringify(this.cipherAlgo.keyLengths));
		}
		
		if (!this.cipherAlgo) {
			this.setFieldError('cipherAlgo','Choose a cryptographic algorithm');
		}
		
		if (this.iv && ! this.blockCipherMode.hasIV) {
			this.setFieldError('IV','IV shall not be set for the block cipher Mode');
		}

		
		return true;
		
		
	}
	
	this.cipher = function(form:any,cipherMode:boolean) {
		this.submitted = true;
		this.form = form;
		
		
		if (! this.isValidForm(cipherMode)) {	
			return;
		}
		

     	try {
			var aCipher = cryptolib.cipher.createCipher(this.cipherAlgo,this.blockCipherMode,this.padding);
			var ivBuffer : Buffer = null;
			if (this.iv) {
				ivBuffer = new Buffer(this.iv,'hex');
			}
			aCipher.init(new Buffer(this.key,'hex'),cipherMode,ivBuffer);
			var resBuffer= aCipher.finish(new Buffer(this.data,'hex'));
		    this.result = resBuffer.toString('hex').toUpperCase();
		 }
		 catch(e) {
			 console.log(JSON.stringify(e));
		 }
		
	}

}