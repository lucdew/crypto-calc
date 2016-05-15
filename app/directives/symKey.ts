import { cipher } from '../../crypto-lib';

export interface ISymKeyScope extends angular.IScope {
  size: number;
  kcv: string;
  parity: cipher.IParityCheck;
  errorMsg: string;
  cipherAlgo: cipher.ICipherAlgo;
  model: string;
}

export class SymKey {
  
  public restrict = 'E';
  //replace : true,
  public scope = {
    'name': '@',
    'label': '@',
    'model': '=',
    'cipherAlgo': '=',
    'errorMsg': '='
  };

  public template = (element: angular.IAugmentedJQuery, attrs: any) => {
    let tpl =
      `
      <div class="container-fluid noside-padding">
          <div class="row">
              <div class="col-md-1 col-sm-2 bold noright-padding">{{label}}</div>
              <div class="col-md-2 col-sm-2 bold noside-padding">KCV: {{kcv}}</div>
              <div class="col-md-2 col-sm-2 bold noside-padding">Size: {{size}} bits</div>
              <div class="col-md-3 col-sm-4 bold noside-padding">
                  <span ng-show="cipherAlgo.name=='DES' || cipherAlgo.name=='3DES'">
                    Parity: {{parity.valid}}<span ng-show="parity.adjustedKey && !(parity.valid)">,
                    Adjusted: {{parity.adjustedKey.toString('hex')}}</span>
                  </span>
              </div>
              <div class="col-md-4 col-sm-2 bold noside-padding red">{{errorMsg}}</div>

          </div>
          <input class="form-control" name="{{name}}" type="text" ng-model="model"`;

    if (attrs.ngClass) {
      tpl += ' ng-class="' + attrs.ngClass + '"';
    }
    if (attrs.$attr.autofocus) {
      tpl += ' autofocus';
    }
    if (attrs.$attr.required) {
      tpl += ' required';
    }

    tpl += '></div>';

    return tpl;

  }

  public link: (scope: ISymKeyScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

  public constructor() {
    SymKey.prototype.link = function(scope: ISymKeyScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
      scope.size = 0;
      scope.kcv = '';
      scope.parity = undefined;


      function updateKeyInfo() {
        let keySize = scope.size,
          cipherAlgo = scope.cipherAlgo;

        // TODO: indexOf not portable
        if (typeof keySize !== 'number' || (keySize % 2) !== 0 || keySize < 64 ||
          !cipherAlgo || cipherAlgo.keyLengths.indexOf(keySize) === -1) {
          scope.kcv = '';
          scope.parity = undefined;
        }
        try {
          let data: Buffer = new Buffer(scope.model, 'hex');
          scope.kcv = cipher.computeKcv(data, cipherAlgo, 3);
          scope.parity = cipher.checkAndAdjustParity(data);
        } catch (e) {
          scope.kcv = '';
          scope.parity = undefined;
        }


      }

      scope.$watch('cipherAlgo', function(newValue: any, oldValue: any) {
        updateKeyInfo();

      });

      scope.$watch('model', function(newValue: any, oldValue: any) {
        let keySize = 0;
        scope.errorMsg = '';

        if (newValue && (newValue.length % 2) === 0) {
          keySize = newValue.length * 4;
        } else {
          keySize = 0;
        }

        scope.size = keySize;
        updateKeyInfo();
      });
    }
  };
  
  
  public static Factory() {
    return () => new SymKey();
  }

}
