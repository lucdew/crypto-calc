import { ISendToMenuService } from "./services";

const routeConfig: any =  [{
        path: "/",
        redirectTo: "/symencrypt"
      }, {
        path: "/symencrypt",
        component: "symencrypt"
      }, {
        path: "/asymmetric",
        component: "asymmetric"
      }, {
        path: "/banking",
        component: "banking"
      }, {
        path: "/digest",
        component: "digest"
      }, {
        path: "/utils/encoding",
        component: "utils.encoding"
      }, {
        path: "/utils/bitwise",
        component: "utils.bitwise"
      }, {
        path: "/about",
        component: "about"
      }

    ];

export class AppController {

  public activeState: string;

  public static Factory() {

    let controller = ($router: any, $scope: ng.IScope, $location: ng.ILocationService, sendToMenuService: ISendToMenuService) =>
          new AppController($router,$scope,$location,sendToMenuService);
    controller.$inject = ["$router", "$scope", "$location", "SendToMenuService"];
    (<any>controller).$routeConfig = routeConfig;
    return controller;
  }

  constructor($router: any, $scope: ng.IScope, $location: ng.ILocationService, sendToMenuService: ISendToMenuService) {

   let self = this;
    $scope.$watch(function() {
      return $location.path();
    }, (value: any) => {
      angular.forEach(routeConfig, (val, idx) => {
        if (val.path === value) {
          if (val.components) {
            self.activeState = val.components.default;
          }
        }
      });

    });

    sendToMenuService.registerMenuItem("symencrypt.data", "Send to Symmetric.Encrypt/Decrypt Data");
    sendToMenuService.registerMenuItem("digest.data", "Send to Digest");
    sendToMenuService.registerMenuItem("asymmetric.cipher.data", "Send to RSA.Encrypt/Decrypt Data");
    sendToMenuService.registerMenuItem("bitwise.dataList[0].value", "Send to Utils.Bitwise data1");
    sendToMenuService.registerMenuItem("bitwise.dataList[1].value", "Send to Utils.Bitwise data2");

  }
}
