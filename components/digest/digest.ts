/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

var digestModule = angular.module('CryptoCalcModule.digest', ['CryptoCalcModule.common']);

digestModule.controller('DigestController',['$timeout','cryptolib',DigestController]);

function DigestController($timeout:angular.ITimeoutService,cryptolib:Cryptolib.CryptoLibStatic) {
	
	var self = this;

	this.messageDigestTypes = cryptolib.util.values(cryptolib.messageDigest.messageDigestType);
	
	this.mode = 'digest';
	
	this.messageDigestType = this.messageDigestTypes[0];
	
	this.setMessageDigestType = (aMessageDigestType:Cryptolib.MessageDigest.IMessageDigestType) => {
		this.messageDigestType = aMessageDigestType;
		this.computeDigest();
	}
	
	this.setMode = (aMode:string) =>  {
		this.mode = aMode;
		this.computeDigest();
	}
	
	
	this.activate = function($scope:angular.IScope) {
		
		$scope.$watch('digest.data',function(newValue:any,oldValue:any) {
			if (self.lastError) {
				$timeout.cancel(self.lastError);
			}
			self.computeDigest();
		});
		
		$scope.$watch('digest.key',function(newValue:any,oldValue:any) {
			if (self.lastError) {
				$timeout.cancel(self.lastError);
			}
			self.computeDigest();
		});
		
	
	}
	
     self.resetResult = () => {
             
            self.lastError = $timeout(() => {
				this.result = '';
            },200); 
     };
	
	
	this.computeDigest = function(digestData:Buffer,digestKey:Buffer) {
		var data:Buffer;
		var key:Buffer;
		if (!self.data) {
			self.result='';
			return;
		}
		try {
			data = new Buffer(self.data,self.dataType);
		}
		catch(e) {
			// Component alreay reports format errors
			self.resetResult();
			return;
		}
		if (self.mode==='hmac') {
			try {
				key = new Buffer(self.key,self.keyType);
			}
			catch(e) {
				// Component alreay reports format errors
				self.resetResult();
				return;
			}
			self.result = cryptolib.mac.hmac(self.messageDigestType,key,data).toString(self.resultType);
		}
		else {
			self.result = cryptolib.messageDigest.digest(self.messageDigestType,data).toString(self.resultType);
		}
		
		
	}
	
	
	
	
}