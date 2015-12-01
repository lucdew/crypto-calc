/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

var digestModule = angular.module('CryptoCalcModule.digest', ['CryptoCalcModule.common']);

digestModule.controller('DigestController',['$timeout','cryptolib',DigestController]);

function DigestController($timeout:angular.ITimeoutService,cryptolib:Cryptolib.CryptoLibStatic) {
	
	var self = this;

	this.messageDigestTypes = cryptolib.util.values(cryptolib.messageDigest.messageDigestType);
	
	this.mode = 'digest';
	this.results={};
	
	this.messageDigestType = this.messageDigestTypes[0];
	this.results[this.messageDigestType]=new Buffer('');
	
	this.setMessageDigestType = (aMessageDigestType:any) => {
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
		self.results={};
		if (!self.data || self.data.length===0) {
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
			if (self.messageDigestType==='ALL') {
				self.messageDigestTypes.forEach(md => {
					self.results[md.name] = cryptolib.mac.hmac(md,key,self.data);
				});
			}
			else {
				self.results[self.messageDigestType.name] =  cryptolib.mac.hmac(self.messageDigestType,key,self.data);
			}
			
		}
		else {
			if (self.messageDigestType==='ALL') {
				self.messageDigestTypes.forEach(md => {
					self.results[md.name] = cryptolib.messageDigest.digest(md,self.data);
				});
			}
			else {
				self.results[self.messageDigestType.name] = cryptolib.messageDigest.digest(self.messageDigestType,self.data);
			}
		}
	}
	
	
	
	
}