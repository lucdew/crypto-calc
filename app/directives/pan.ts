import { banking } from "../../crypto-lib";

export class Pan {

  public restrict = "E";
  public scope = {
    "name": "@",
    "model": "=",
    "errorMsg": "="
  };

  public link: (scope: any, element: angular.IAugmentedJQuery, attrs: any) => void;

  public static Factory() {
    let directive = ($timeout: ng.ITimeoutService) => {
      return new Pan($timeout);
    };

    directive.$inject = ["$timeout"];

    return directive;
  }

  public template = (element: angular.IAugmentedJQuery, attrs: any) => {

    let tpl = `
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-3 col-sm-3 noside-padding red"> {{errorMsg}}</div>
            </div>
            <div class="row">

              <div class="col-md-2 col-sm-4 noside-padding">

            <input class="form-control" style="width:170px" maxlength="19"
                    size="19" name="{{name}}" type="text" ng-model="model"`;

    if (attrs.ngClass) {
      tpl += " ng-class=\"" + attrs.ngClass + "\"";
    }
    if (attrs.$attr.autofocus) {
      tpl += " autofocus";
    }
    if (attrs.$attr.required) {
      tpl += " required";
    }

    tpl += `>
        </div>
            <div class="col-md-3 col-sm-4 noside-padding" style="font-size:11px">
                <div class="bold">Issuing Network : {{issuingNetwork}}</div>
                <div class="bold" >Check digit: <span ng-show="valid" >{{checkDigit}}</span></div>

              </div>
              <div class="col-md-2 col-sm-4 noside-padding" style="font-size:11px">
                  <div class="bold">Account Id: {{accountIdentifier}}</div>
                  <div class="bold">Issuer Id: {{issuerIdentificationNumber}}</div>
        </div>
        </div>`;


    return tpl;
  }

  constructor($timeout: ng.ITimeoutService) {

    Pan.prototype.link = (scope: any, element: angular.IAugmentedJQuery, attrs: any) => {
      scope.$watch("model", function(newValue: any, oldValue: any) {
        if (newValue === oldValue) {
          return;
        }
        try {
          if (newValue.length >= 12) {

            let pan: banking.IPan = banking.createPanFromString(newValue);
            scope.issuingNetwork = pan.issuingNetwork.name;
            scope.accountIdentifier = pan.individualAccountIdentifier;
            scope.issuerIdentificationNumber = pan.issuerIdentificationNumber;
            scope.checkDigit = pan.checkDigit;
            scope.valid = pan.isValid();
            return;
          }

        } catch (e) {
          // TODO
        }
        scope.issuingNetwork = "";
        scope.accountIdentifier = "";
        scope.checkDigit = "";
        scope.issuerIdentificationNumber = "";
        scope.valid = "";
      });
    };

  }


}
