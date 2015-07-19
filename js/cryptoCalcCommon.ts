/// <reference path="../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../crypto-lib/cryptolib.d.ts"/>

module CryptoCalcModule {
        
        declare var buffer:any;
        var cryptoCalcCommonModule = angular.module('CryptoCalcModule.common',
         ['ngAnimate']);
         
         
         cryptoCalcCommonModule.factory('cryptolib',function() {
                           
             return (<any>window).cryptolib;

         });
         
         cryptoCalcCommonModule.factory('CryptoCalc',function() {
                           
                  return {
                          
                          encrypt : {},
                          utils: {}
                  }

         });     
         
         cryptoCalcCommonModule.directive('databox', 
            function() {
                   return {
                       restrict:'E',
                       //replace : true,
                       scope:  {
                          'name' : '@',
                          'rows' : '@',
                          'label' : '@',
                          'model' : '=',
                          'type' : '@',
                          'errorMsg' : '='         
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                            
                                                               
                           
                           var errorHtml = element.html();
                           var tpl =  `
                           <div class="container-fluid" style="padding:0">
                                <div class="row">
                                   <div class="col-md-2 col-sm-2 bold" style="padding-right:0;">{{label}}</div>
                                   <div class="col-md-4 col-sm-4 noside-padding red"> {{errorMsg}}</div>
                               <div class="col-md-2 col-sm-2 col-md-offset-2 col-sm-offset-2 bold noside-padding">Chars : {{charsNum}}</div>      
                               <div class="col-md-2 col-sm-2 bold noside-padding" >Size (bytes): {{size}}</div>
                                </div>
                                <textarea class="form-control" name="{{name}}" type="text" ng-model="model" rows="{{rows}}" `
                            
                             if (attrs.ngClass) {
                                     tpl+=" ng-class=\""+attrs.ngClass+"\"";
                             }
                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+="></div>";
                             
                            
                             return tpl;                       
                        } ,           
                        link: function(scope:any,element:angular.IAugmentedJQuery,
                          attrs:any){
                       
                               
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                     
                                  var size = 0,charsNum = 0;
                                  scope.errorMsg = '';
                                  
                                  var type = attrs.type;
                                  
                                  if (newValue) {
                                          
                                    try {
                                         var buf = new buffer.Buffer(newValue,type);
                                         size = buf.length;
                                         charsNum = newValue.length;
                                    }
                                    catch(e) {
                                        console.log(e);
                                        
                                    } 
                                  }
                                   
                                  scope.size = size;
                                  scope.charsNum = charsNum;

                             });
           
                        }
                             
                     }
           
                  
                  });

          cryptoCalcCommonModule.directive('pan', 
            function($timeout:any,cryptolib:Cryptolib.CryptoLibStatic) {
                   return {
                       restrict:'E',
                       scope:  {
                          'name' : '@',
                          'model' : '=',
                          'errorMsg' : '='
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                            
                                                               
                           
                           var errorHtml = element.html();
                           var tpl =  `
                           <div class="container-fluid">
                                <div class="row">
                                   <div class="col-md-3 col-sm-3 noside-padding red"> {{errorMsg}}</div>
                                </div>
                                <div class="row">
         
                                 <div class="col-md-4 col-sm-4 noside-padding">
         
                                <input class="form-control" style="width:170px" maxlength="19" size="19" name="{{name}}" type="text" ng-model="model"`
                            
                             if (attrs.ngClass) {
                                     tpl+=" ng-class=\""+attrs.ngClass+"\"";
                             }
                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+=`>
                             
                             </div>
                             
    
                                  <div class="col-md-4 col-sm-4 noside-padding" style="font-size:11px">
                                      <div class="bold">Issuing Network : {{issuingNetwork}}</div>
                                      <div class="bold" >Check digit: <span ng-show="valid" >{{checkDigit}}</span></div>
                                      
                                   </div>
                                   <div class="col-md-4 col-sm-4 noside-padding" style="font-size:11px"> 
                                        <div class="bold">Account Id: {{accountIdentifier}}</div> 
                                        <div class="bold">Issuer Id: {{issuerIdentificationNumber}}</div>                                       
                                   </div>
                             </div>
                             
                             
                             </div>`;
                             
                            
                             return tpl;    

                        
                                
                                
                        } ,           
                        link: function(scope:any,element:angular.IAugmentedJQuery,
                          attrs:any){
                       
                               
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                  if (newValue===oldValue) {
                                      return;
                                  }
                                  try {
                                      if (newValue.length >=12) {
                                             
                                              var pan:Cryptolib.Banking.IPan=cryptolib.banking.createPanFromString(newValue);
                                              scope.issuingNetwork=pan.issuingNetwork.name;
                                              scope.accountIdentifier = pan.individualAccountIdentifier;
                                              scope.issuerIdentificationNumber = pan.issuerIdentificationNumber;
                                              scope.checkDigit = pan.checkDigit;
                                              scope.valid = pan.isValid();
                                              return;    
                                      }
      
                                  } 
                                  catch(e) {
                                       // TODO
                                  }
                                  scope.issuingNetwork='';
                                  scope.accountIdentifier = '';
                                  scope.checkDigit='';
                                  scope.issuerIdentificationNumber='';
                                  scope.valid = '';
                                  

                             });
           
                        }
                             
                     }
            });
 
         cryptoCalcCommonModule.directive('symKey', 
            function($timeout:any,cryptolib:Cryptolib.CryptoLibStatic) {
                   return {
                       restrict:'E',
                       //replace : true,
                       scope:  {
                          'name' : '@',
                          'label' : '@',
                          'model' : '=',
                          'cipherAlgo' : '='   
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                                  

                           
                            
                           var tpl =
                        `
                           <div class="container-fluid" style="padding:0">
                                <div class="row">
                                   <div class="col-md-4 col-sm-4 bold">{{label}}</div>
                                   <div class="col-md-2 col-sm-2 col-md-offset-2 col-sm-offset-2 bold" ><span ng-show="cipherAlgo=='DES' || cipherAlgo=='3DES'">Parity: {{parity}}</span></div>
                                   <div class="col-md-2 col-sm-2 bold">KCV: {{kcv}}</div>
                                   <div class="col-md-2 col-sm-2 bold">Size: {{size}}</div>
                                   
                                </div>
                                <input class="form-control" name="{{name}}" type="text" ng-model="model"`;
                                                       
                             if (attrs.ngClass) {
                                     tpl+=" ng-class=\""+attrs.ngClass+"\"";
                             }
                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+="></div>";
                             
                             return tpl;   

                        
                        },           
                        link: function(scope:angular.IScope,element:angular.IAugmentedJQuery,
                          attrs:angular.IAttributes){
                             
                            
                             scope['size']=0;
                             scope['kcv']='';
                             scope['parity']='';
                             
                             
                             function updateKeyInfo() {
                                     var keySize = scope['size'],
                                         cipherAlgo = scope['cipherAlgo'];
                                         
                                         // TODO: indexOf not portable
                                         if (typeof keySize !== 'number' || (keySize % 2) !== 0 || keySize < 64 || 
                                                 ! cipherAlgo || cipherAlgo.keyLengths.indexOf(keySize) === -1 ) {
                                                scope['kcv']='';
                                                scope['parity']='';
                                          }
                                          try {
                                               var data:Buffer = new Buffer(scope['model'],'hex');
                                               scope['kcv'] = cryptolib.cipher.computeKcv(data,cipherAlgo,3);
                                          }
                                          catch(e) {
                                                scope['kcv']='';
                                                scope['parity']='';
                                          }
                                      
                                         
                             }

                             scope.$watchGroup(['cipherAlgo','size'],function(newValue:any,oldValue:any) {
                                    
                                     updateKeyInfo();
                                     
                             });
                               
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                   var keySize = 0;
                                   if (newValue && (newValue.length%2)===0) {
                                        keySize =  newValue.length*4;
                                   }
                                   else {
                                        keySize = 0;
                                   }
                                   
                                   $timeout(function(){
                                        scope.$apply(()=> {
                                         scope['size']=keySize;      
                                        });
                                   });
                            
                                   

                             });
           
                        }
                             
                     }
           
                  
                  });
 
 
          cryptoCalcCommonModule.directive('preventDefault', 
            function() {
                  
                  return {
                      link: function (scope, elem, attrs, ctrl) {
                      
                        elem.bind('click', function (event) {
                            event.preventDefault();
                        });
                       }
                  }   
                          
                          
            });               
                  
   
        

}	

   


	
	
