/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>

declare var buffer : any;
angular.module('CryptoCalcModule.utils', ['CryptoCalcModule.common'])
       .controller('UtilsController',['cryptolib',UtilsController])
       .directive('cryptoConverter',function(cryptolib) {
           return {
               restrict:'E',
               scope:  {
                  'dataToConvert':'=ngModel'              
               },
                template: `
                <div class="bottom7">
                    <databox type="hex" name="hex" model="dataToConvert.hex" rows="2" label="Hexa"></databox>
                </div>
                <div class="bottom7">
                   <databox type="ascii" name="ascii" model="dataToConvert.ascii" rows="2" label="Ascii"></databox>
                </div>
                <div class="bottom7">
                   <databox type="base64" name="base64" model="dataToConvert.base64" rows="2" label="Base64"></databox>
                </div>
                <databox type="utf8" name="utf8" model="dataToConvert.utf8" rows="2" label="Utf8"></databox>             
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
       

function UtilsController(cryptolib:Cryptolib.CryptoLibStatic) {
    console.log('Loading crypto '+cryptolib);
    this.bitwiseOperators = [
      { name: 'XOR', func : cryptolib.util.xor},
      { name: 'AND', func : cryptolib.util.and},
      { name: 'OR', func : cryptolib.util.or },
      { name: 'NOT', func : cryptolib.util.not }  
    ];
    this.bitwise = {};
    this.bitwise.bitwiseOperator = this.bitwiseOperators[0];
    this.setBitwiseOperator = function(aBitwiseOperator:any) {
      this.bitwise.bitwiseOperator = aBitwiseOperator;
      
    }
    
    this.executeBitwiseOperation = function() {
      var result : Buffer;
      if (this.bitwise.bitwiseOperator.name === 'NOT') {
        result = this.bitwise.bitwiseOperator.func.call(null,new Buffer(this.bitwise.data1,'hex'));
      }
      else {
         result = this.bitwise.bitwiseOperator.func.call(null,new Buffer(this.bitwise.data1,'hex'),new Buffer(this.bitwise.data2,'hex'));
      }
      
      this.bitwise.result = result.toString('hex').toUpperCase();
      
      
    }
	
}