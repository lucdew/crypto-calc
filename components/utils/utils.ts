/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

declare var buffer : any;
angular.module('CryptoCalcModule.utils', ['CryptoCalcModule.common'])
       .controller('UtilsBitwiseController',['cryptolib',BitwiseController])
       .controller('UtilsEncodingController',[EncodingController])
       .directive('cryptoConverter',function(cryptolib) {
           return {
               restrict:'E',
               scope:  {
                  'dataToConvert':'=ngModel'              
               },
                template: `
                <div class="bottom7">
                    <databox types="hex" name="hex" model="dataToConvert.hex" rows="2" label="Hexa"></databox>
                </div>
                <div class="bottom7">
                   <databox types="ascii" name="ascii" model="dataToConvert.ascii" rows="2" label="Ascii"></databox>
                </div>
                <div class="bottom7">
                   <databox types="base64" name="base64" model="dataToConvert.base64" rows="2" label="Base64"></databox>
                </div>
                <databox types="utf8" name="utf8" model="dataToConvert.utf8" rows="2" label="Utf8"></databox>             
                `,           
                link: function(scope:angular.IScope,element:angular.IAugmentedJQuery,
                  attrs:angular.IAttributes){
                    
                       function convertAll(inputData:string,inputType:string) {
                         var allTypes = ['hex','ascii','base64','utf8'];
                         
                         var convertData:any = {};
                         
                         var b:any;
                         convertData[inputType] = inputData;
                          try {
                             b = buffer.Buffer(inputData,inputType);                        
                           }
                           catch(e) {
                              return convertData;
                           }
                         
                         for (var i=0;i<allTypes.length;i++) {
                           var outType=allTypes[i];
                           if (outType !== inputType) {
                             convertData[outType] = b.toString(outType);
                             if (outType === 'hex') {
                                  convertData[outType] = convertData[outType].toUpperCase();
                             }
                           }
                         }
                         return convertData;
                       }
                                   
                       element.on('focus blur keyup change',(evt:any)=> {
                           try {
                            // TODO find parent databox type
                             var convertMap = convertAll(evt.target['value'],evt.target['name']);
                              scope.$apply(function() {
                               scope['dataToConvert']=convertMap;
                             });
                             
                           }
                           catch(e) {
                             //
                           }
                           
            
                       });
                 
                  
                 
   
                }
               
               
               
           }
           
           
           
       })

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
    
    this.dataList = [{value:''},{value:''}];
    
    this.setBitwiseOperator = (aBitwiseOperator:any) => {
      this.bitwiseOperator = aBitwiseOperator;  
    }
    this.addDataElt = () => {
        this.dataList.push({value:''});
    }
    this.removeDataElt = () => {
        if (this.dataList.length > 2) {
            this.dataList.pop();
        }     
    }
    
    this.executeBitwiseOperation = () => {
      this.result='';
      var result : Buffer;
      if (this.bitwiseOperator.name === 'NOT') {
        result = this.bitwiseOperator.func.call(null,new Buffer(this.dataList[0].value,'hex'));
      }
      else {
         result = new Buffer(this.dataList[0].value,'hex');
         for (var idx=1;idx<this.dataList.length;idx++) {
            result = this.bitwiseOperator.func.call(null,result,new Buffer(this.dataList[idx].value,'hex')); 
         }
         
      }
      
      this.result = result.toString('hex').toUpperCase();
      
      
    }
	
}


// BitwiseController.prototype.activate = function (scope) {
//     // Renamed controller's name in the view since it holds a dot and is not well interpreted
//     scope.bitwise = scope['utils.bitwise']; 
// }
// BitwiseController.prototype.activate.$inject = ['$scope'];