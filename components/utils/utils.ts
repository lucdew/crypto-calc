/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

declare var buffer : any;
angular.module('CryptoCalcModule.utils', ['CryptoCalcModule.common'])
       .controller('UtilsBitwiseController',['cryptolib',BitwiseController])
       .controller('UtilsEncodingController',[EncodingController]);

function EncodingController() {
    
}       

function BitwiseController(cryptolib:Cryptolib.CryptoLibStatic) {

    this.bitwiseOperators = [
      { name: 'XOR', func : cryptolib.util.xor},
      { name: 'AND', func : cryptolib.util.and},
      { name: 'OR', func : cryptolib.util.or },
      { name: 'NOT', func : cryptolib.util.not }  
    ];
    this.bitwiseOperator = this.bitwiseOperators[0];
    
    this.dataList = [{value: new Buffer('')},{value:new Buffer('')}];
    
    this.setBitwiseOperator = (aBitwiseOperator:any) => {
      this.bitwiseOperator = aBitwiseOperator;  
    }
    this.addDataElt = () => {
        this.dataList.push({value: new Buffer('')});
    }
    this.removeDataElt = () => {
        if (this.dataList.length > 2) {
            this.dataList.pop();
        }     
    }
    
    this.executeBitwiseOperation = () => {
      var result : Buffer;
      
      try {
        if (this.bitwiseOperator.name === 'NOT') {
            result = this.bitwiseOperator.func.call(null,this.dataList[0]);
        }
        else {
            result = this.dataList[0].value;
            for (var idx=1;idx<this.dataList.length;idx++) {
                console.log(this.dataList[idx].value.toString('hex'));
                result = this.bitwiseOperator.func.call(null,result,this.dataList[idx].value); 
            }
            
        }
        this.result = result;   
    }
    catch(err) {
        console.log(err);
    }
    }
	
}


// BitwiseController.prototype.activate = function (scope) {
//     // Renamed controller's name in the view since it holds a dot and is not well interpreted
//     scope.bitwise = scope['utils.bitwise']; 
// }
// BitwiseController.prototype.activate.$inject = ['$scope'];