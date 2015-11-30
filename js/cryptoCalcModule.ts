/// <reference path="../d.ts/angularjs/angular.d.ts"/>

module CryptoCalcModule {
    
       function dotCase(str:string) {
          return str.replace(/([A-Z])/g, function ($1) {
             return '.' + $1.toLowerCase();
            });
       }
       
       function computePath(componentName:string):string {
            var names =  componentName.split('.');
            names.push(names[names.length-1]); // repeat last
            var path = "";
            for (var idx=0;idx<names.length;idx++) {
                if (idx>0) {
                    path += '/';
                }
                path += dotCase(names[idx]);
            }
            return path + '.html';
       }
       
       export var cryptoCalcModule = angular.module('CryptoCalcModule',
         ['ngNewRouter','CryptoCalcModule.symencrypt','CryptoCalcModule.asymmetric','CryptoCalcModule.banking','CryptoCalcModule.digest',
                 'CryptoCalcModule.utils']);
                 
                 
       cryptoCalcModule.config(function ($componentLoaderProvider) {
            $componentLoaderProvider.setTemplateMapping(function (name:string) {
                var computedPath = computePath(name);
                return 'components/' + computedPath ;
            });

            $componentLoaderProvider.setCtrlNameMapping(function (name:string) {
                var names =  name.split('.');
                var ctrlName = "";
                for (var idx=0;idx<names.length;idx++) {
                    ctrlName += names[idx][0].toUpperCase() + names[idx].substr(1);
                }
                return ctrlName + 'Controller';
            });
       });
    
    
       cryptoCalcModule.controller('AppController',['$router','$scope','$location',AppController]);
    
        (<any>AppController).$routeConfig = [
             { path: '/',            redirectTo: '/symencrypt' },
             { path: '/symencrypt',  component: 'symencrypt' },
             { path: '/asymmetric',  component: 'asymmetric' },
             { path: '/banking',     component: 'banking' },
             { path: '/digest',     component: 'digest' },
             { path: '/utils/encoding',  component: 'utils.encoding'},
             { path: '/utils/bitwise',  component: 'utils.bitwise'},
             { path: '/about',       component: 'about' }
            
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

   


	
	
