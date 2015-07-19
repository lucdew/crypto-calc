/// <reference path="../d.ts/angularjs/angular.d.ts"/>

module CryptoCalcModule {
       export var cryptoCalcModule = angular.module('CryptoCalcModule',
         ['ngNewRouter','CryptoCalcModule.symencrypt','CryptoCalcModule.banking','CryptoCalcModule.utils']);
    
    
       cryptoCalcModule.controller('AppController',['$router','$scope','$location',AppController]);
    
        (<any>AppController).$routeConfig = [
             { path: '/',            redirectTo: '/symencrypt' },
             { path: '/symencrypt',  component: 'symencrypt' },
             { path: '/banking',     component: 'banking' },
             { path: '/utils',       component: 'utils' }
            
        ];
        
        function AppController($router:any,$scope:any,$location:angular.ILocationService) {
            var self = this;
            $scope.$watch(function(){
                    return $location.path();
                }, function(value:any){
                    angular.forEach((<any>AppController).$routeConfig,(val,idx)=> { 
                       if (val.path===value) {
                              if (val.components) {
                                 self.activeState = val.components.default;
                              }
   
                       }
                    });
                   
                });
        } 
        
        

}	

   


	
	
