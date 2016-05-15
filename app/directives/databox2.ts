import { ISendToMenuService } from '../services';
import * as _ from 'lodash';

declare const $jq: any;

const typesMetadata = {
  hex: {
    desc: 'Hexa',
    regexp: /^(\s*[0-9a-fA-F][0-9a-fA-F]\s*)+$/,
  },
  utf8: {
    desc: 'Utf-8',
    regexp: /[A-Za-z\u0080-\u00FF ]+/ // weak regexp to lack of support in Ecmascript 5
  },
  ascii: {
    desc: 'Ascii',
    regexp: /^[\x00-\x7F]+$/
  },
  int: {
    desc: 'Integer',
    regexp: /^[0-9]+$/
  },
  base64: {
    desc: 'Base64',
    regexp: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
  }
};


export class Databox2 {

  public link: (scope: any, element: ng.IAugmentedJQuery, attrs: any, controllers: Array < any > ) => void;
  public restrict = 'E';
  public require = ['^ngModel', '^form'];
  public template = (element: ng.IAugmentedJQuery, attrs: any) => {
    if (attrs.widthInCols && attrs.widthInPixels) {
      throw 'Both attributes widthInPixels and widthInCols have been set, choose one';
    }
    return `
            <div class="container-fluid" style="padding:0">
                <div class="row vertical-align bottom5">
                    <div class="col-md-2 col-sm-4 noright-padding">
                            <span class="bold">{{label}}</span>
                            <div class="btn-group left5 btn-group-default buttons">
                                <label class="btn btn-xs btn-default"
                                        ng-class="{'active': atype === $parent.type}" ng-repeat="atype in types.split(',')">
                                        <input type="radio" autocomplete="off" ng-model="$parent.type" value="{{atype}}">
                                        {{getTypeDescription(atype)}}
                                </label>
                            </div>
                    </div>
                    <div class="col-md-1 col-sm-2 bold noside-padding"
                          ng-if="!showCharsnum || showCharsnum =='true'">Chars: {{charsNum}}</div>
                    <div class="col-md-1 col-sm-2 bold noside-padding"
                          ng-if="!showSize || showSize == 'true'" >Size: {{size}} bytes</div>
                    <div class="col-md-8 col-sm-4 noside-padding red bold" >{{errorMsg ||typeErrorMsg}}</div>
                </div>
                <div class="row vertical-align bottom5" >
                    <div class="noright-padding" ng-class="widthInCols">
                        <textarea class="form-control" name="{{name}}" ng-model="encodedBuffer" type="text" rows="{{rows}}"
                            ng-style="databoxStyle"
                            ng-required="required" ng-focus="autofocus">
                        </textarea>
                    </div>
                </div>
              </div>
                `;
  };
  public scope = {
    'rows': '@',
    'ngModel': '=',
    'widthInCols': '@',
    'label': '@',
    'name': '@',
    'types': '@',
    'showSize': '@',
    'showCharsnum': '@',
    'showErrors': '@',
    'required': '@',
    'withMenu': '@',
    'autofocus': '@'
  };




  private getMenuPosition(mouse, direction, scrollDir) {
    let win = $jq(window)[direction](),
      scroll = $jq(window)[scrollDir](),
      menu = $jq('#contextMenu')[direction](),
      position = mouse + scroll;

    // opening menu would pass the side of the page
    if (mouse + menu > win && menu < mouse) {
      position -= menu;
    }

    return position;
  }

  private addItemToMenu(parentElt: angular.IAugmentedJQuery, key: string, item: any) {
    if (angular.isString(item)) {
      parentElt.append(`<li class="menu-item"><a tabindex="-1" href="#"
          ng-click="sendToData($event,'${item}')">${key}</a></li>`);
    } else {
      let subMenuElt = angular.element(` <li class="menu-item dropdown dropdown-submenu">
                              <a href="#" class="dropdown-toggle" data-toggle="dropdown" on>${key}</a>
                              <ul class="dropdown-menu"/>
                          </li>`);
      parentElt.append(subMenuElt);

      for (let subKey in item) {
        if (item.hasOwnProperty(subKey)) {
          this.addItemToMenu(subMenuElt.find('.dropdown-menu'), subKey, item[subKey]);
        }
      }
    }
  }

  constructor($timeout: ng.ITimeoutService, $compile: ng.ICompileService, sendToMenuService: ISendToMenuService) {


    Databox2.prototype.link = (scope: any, element: angular.IAugmentedJQuery,
      attrs: any, controllers: Array < any > ) => {

      let ngModelCtrl: angular.INgModelController = controllers[0];
      let formController: angular.IFormController = controllers[1];

      // use $setOptions of 1.6 , see if need to be kept
      ( < any > ngModelCtrl).$$setOptions({
        allowInvalid: true,
        updateOnDefault: true,
        debounce: 0
      });

      let databoxStyle: any = {};

      if (attrs.rows && attrs.rows === '1') {
        databoxStyle.resize = 'none';
        databoxStyle.overflow = 'hidden';
      }
      scope.databoxStyle = databoxStyle;

      scope.getTypeDescription = (aType) => {
        return (aType in typesMetadata) ? typesMetadata[aType].desc : '';
      };

      scope.$on('$destroy', () => {
        if (scope.lastError) {
          $timeout.cancel(scope.lastError);
          scope.lastError = undefined;
        }
      });

      scope.setValid = function() {
        if (scope.lastError) {
          $timeout.cancel(scope.lastError);
        }
        ngModelCtrl.$setValidity('databoxData', true);
        scope.typeErrorMsg = undefined;
      };

      scope.setInvalid = () => {
        scope.lastError = $timeout(() => {

          let typeMetadata = typesMetadata[scope.type];
          ngModelCtrl.$setValidity('databoxData', false);
          let typeDesc = typeMetadata.desc;
          if (scope.type === 'hex' && scope.encodedBuffer.length % 2 !== 0) {
            scope.typeErrorMsg = 'Invalid length for ' + typeDesc + ' string';
          } else {
            scope.typeErrorMsg = 'Invalid characters for type ' + typeDesc;
          }
        }, 200);
      };

      ngModelCtrl.$formatters.push(function(modelValue: Buffer) {

        let type = scope.type || (scope.types ? scope.types[0] : 'hex');
        let encodedBuffer = '';
        if (modelValue) {
          if (type === 'int') {
            encodedBuffer = parseInt(modelValue.toString('hex'), 16).toString();
          } else {
            encodedBuffer = modelValue.toString(type);
          }
          scope.oldModelValue = modelValue;
        }

        return {
          type,
          encodedBuffer,
          size: modelValue ? modelValue.length : 0
        };
      });

      ngModelCtrl.$parsers.push(function(viewValue) {
        scope.setValid();

        if (!viewValue || !viewValue.encodedBuffer) {
          scope.charsNum = 0;
          scope.size = 0;
          return new Buffer('');
        }

        if (viewValue.typeChanged && scope.oldModelValue) {
          let model = new Buffer(scope.oldModelValue.toString('hex'), 'hex');
          ngModelCtrl.$modelValue = model;
          scope.oldModelValue = model;
          return model;
        }

        scope.charsNum = viewValue.encodedBuffer.length;

        let validatingRexep = typesMetadata[scope.type].regexp;
        if (!validatingRexep.test(viewValue.encodedBuffer)) {
          scope.setInvalid();
          return scope.oldModelValue ? scope.oldModelValue : undefined;
        }

        let model;
        try {
          if (viewValue.type === 'int') {
            let valAsHex = parseInt(viewValue.encodedBuffer).toString(16);
            if (valAsHex.length % 2 !== 0) {
              valAsHex = '0' + valAsHex;
            }
            model = new Buffer(valAsHex, 'hex');
          } else {
            model = new Buffer(viewValue.encodedBuffer, viewValue.type);
          }
          scope.size = model.length;
          scope.oldModelValue = model;
          return model;

        } catch (e) {
          scope.size = 0;
          scope.setInvalid();
          return scope.oldModelValue ? scope.oldModelValue : undefined;
        }

      });


      scope.$watch('type + "#" +encodedBuffer', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          let newViewElts = newValue.split('#');
          let oldViewElts = oldValue.split('#');
          ngModelCtrl.$setViewValue({
            type: scope.type,
            encodedBuffer: scope.encodedBuffer,
            typeChanged: newViewElts[0] !== oldViewElts[0]
          });
        }

      });

      ngModelCtrl.$render = function() {

        if (!ngModelCtrl.$viewValue) {
          ngModelCtrl.$viewValue = {
            type: 'hex',
            encodedBuffer: ''
          };
        }

        scope.type = ngModelCtrl.$viewValue.type;
        scope.encodedBuffer = ngModelCtrl.$viewValue.encodedBuffer;
        scope.size = ngModelCtrl.$viewValue.size;
        scope.charsNum = ngModelCtrl.$viewValue.encodedBuffer.length;
      };

      if ('withMenu' in attrs.$attr) {
        let menuElt = angular.element(`<ul id="contextMenu-${scope.name}" class="dropdown-menu"
                                              role="menu" style="display:none" />`);


        let inclusions = [],
          exclusions = [];

        if (attrs.$attr.withMenu && typeof attrs.$attr.withMenu === 'string' && attrs.$attr.withMenu.length > 0) {
          let menuExprs: string[] = attrs.$attr.withMenu.split(',');
          inclusions = _.map(menuExprs, anExpr => {
            let regRes = /\s*\+(.+)/.exec(anExpr);
            return regRes && regRes.length === 1 ? regRes[1] : undefined;
          }).filter(anExpr => {
            return anExpr !== undefined;
          });
          exclusions = _.map(menuExprs, (anExpr) => {
            let regRes = /\s*-(.+)/.exec(anExpr);
            return regRes && regRes.length === 1 ? regRes[1] : undefined;
          }).filter((anExpr) => {
            return anExpr !== undefined;
          });
        }

        let menuTree = sendToMenuService.buildMenuTree(inclusions, exclusions);

        _.forEach(menuTree, (value, key) => {
          this.addItemToMenu(menuElt, key, value);
        });

        let textAreaEl = element.find('textarea').clone();

        //let compiledElt = $compile(menuElt)($rootScope);

        menuElt = $compile(menuElt)(scope);
        element.append(menuElt);

        $jq(document).click(function(e) {
          menuElt.hide();
        });
        scope.sendToData = function($event, path) {
          sendToMenuService.sendTo(path, scope.oldModelValue, scope.$parent);
          //$event.stopPropagation();
          $event.preventDefault();
          //console.log('data2=' + (<any>element.data('$ngModelController')).toString('hex'));
          //sendToMenu.sendToPath(path);
        };


        element.find('textarea').on('contextmenu', (e) => {

          // return native menu if pressing control
          if (e.ctrlKey) {
            return;
          }
          let menu = $jq('#contextMenu-' + scope.name)
            .data('invokedOn', $jq(e.target))
            .show()
            .css({
              position: 'absolute',
              left: this.getMenuPosition(e.clientX, 'width', 'scrollLeft'),
              top: this.getMenuPosition(e.clientY, 'height', 'scrollTop')
            })
            .off('click');

          return false;

        });
        // element.find('textarea').replaceWith(textAreaEl);
      }

      if (attrs.types) {
        scope.type = attrs.types.split(',')[0];
      }

    }

  }


  public static Factory() {
    let directive = ($timeout: ng.ITimeoutService, $compile: ng.ICompileService, sendToMenuService: ISendToMenuService) => {
      return new Databox2($timeout, $compile, sendToMenuService);
    };

    directive['$inject'] = ['$timeout', '$compile', 'SendToMenuService'];

    return directive;
  }

}
