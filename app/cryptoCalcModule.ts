import {AppController} from "./controllers";
import {SendToMenuService} from "./services";
import * as directives from "./directives";
import aboutModule from "./components/about/about";
import digestModule from "./components/digest/digest";
import symEncryptModule from "./components/symencrypt/symencrypt";
import asymmetricModule from "./components/asymmetric/asymmetric";
import utilsModule from "./components/utils/utils";
import bankingModule from "./components/banking/banking";
import "ng-new-router";

module CryptoCalcModule {

    function dotCase(str: string) {
        return str.replace(/([A-Z])/g, function($1) {
            return "." + $1.toLowerCase();
        });
    }

    function computePath(componentName: string): string {
        let names = componentName.split(".");
        names.push(names[names.length - 1]); // repeat last
        let path = "";
        for (let idx = 0; idx < names.length; idx++) {
            if (idx > 0) {
                path += "/";
            }
            path += dotCase(names[idx]);
        }
        return path + ".html";
    }

    export let cryptoCalcModule = angular.module("CryptoCalcModule", ["ngNewRouter", aboutModule, symEncryptModule,
        asymmetricModule, bankingModule, digestModule, utilsModule
    ]);

    cryptoCalcModule.filter("nodash", function() {
        return function(input) {
            input = input || "";
            return input.replace(/_/g, " ").replace(/-/g, " ");
        };
    });

    cryptoCalcModule.factory("SendToMenuService", SendToMenuService.Factory());

    cryptoCalcModule.controller("AppController", AppController.Factory());

    cryptoCalcModule.directive("preventDefault", directives.preventDefault);
    cryptoCalcModule.directive("databox2", directives.Databox2.Factory());
    cryptoCalcModule.directive("pan", directives.Pan.Factory());
    cryptoCalcModule.directive("symKey", directives.SymKey.Factory());


    cryptoCalcModule.config(function($componentLoaderProvider) {
        $componentLoaderProvider.setTemplateMapping(function(name: string) {
            let computedPath = computePath(name);
            return "components/" + computedPath;
        });

        $componentLoaderProvider.setCtrlNameMapping(function(name: string) {
            let names = name.split(".");
            let ctrlName = "";
            for (let idx = 0; idx < names.length; idx++) {
                ctrlName += names[idx][0].toUpperCase() + names[idx].substr(1);
            }
            return ctrlName + "Controller";
        });
    });
}
