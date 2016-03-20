/// <reference path="../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../typings/browser/ambient/angular/index.d.ts"/>
/// <reference path="../typings/browser/ambient/lodash/index.d.ts"/>
/// <reference path="../crypto-lib/cryptolib.d.ts"/>


module CryptoCalcModule {

    declare const buffer: any;
    declare const $jq: any;

    let cryptoCalcCommonModule = angular.module('CryptoCalcModule.common', ['ngAnimate']);

    cryptoCalcCommonModule.factory('cryptolib', function() {
        return (<any>window).cryptolib;
    });

    export interface ISendToMenuService {
        registerMenuItem(receiverName: string, menuPath: string);
        updateContext(contextName: string, context: Object);
        buildMenuTree(inclusions?: Array<string>, exclusions?: Array<string>): Object;
        sendTo(path: string, data: Buffer, scope: any);
    }

    class SendToMenuService implements ISendToMenuService {
            items: any = {};
            memory: any = {};

            $timeout: angular.ITimeoutService;
            $parse: angular.IParseService;

            constructor($timeout: angular.ITimeoutService, $parse: angular.IParseService) {
                this.$timeout = $timeout;
                this.$parse = $parse;
            }

            updateContext(contextName: string, context: Object) {

                _.forOwn(this.memory, (cb, propName) => {
                    if (propName.indexOf(contextName) !== 0 ) {
                        return;
                    }
                    cb.call(null, context);
                    delete this.memory[propName];
                });

            }

            registerMenuItem(menuItemName: string, menuPath: string) {
                this.items[menuItemName] = { menuPath: menuPath};
            };

            buildMenuTree(inclusions?: Array<string>, exclusions?: Array<string>) {
                let filteredMenuItems = _(this.items).pickBy( (value, key) => {
                    return !inclusions || inclusions.length === 0 ||
                             _.find(inclusions, elt => { return _.startsWith(key, elt); }) !== undefined ;
                }).pickBy( (value, key) => {
                    return !exclusions || exclusions.length === 0 ||
                     _.find(exclusions, elt => { return _.startsWith(key, elt); }) === undefined;
                }).value();

                let menu = {};

                _.forEach(this.items, (value, key) => {

                   let parentItem = menu;
                   let pathElts = value.menuPath.split('.');
                   for (let idx = 0; idx < pathElts.length; idx++) {
                       let pathElt = pathElts[idx];
                       if (!parentItem[pathElt]) {
                            parentItem[pathElt] = {};
                        }

                        if (idx === pathElts.length - 1) {
                            parentItem[pathElt] = key;
                        } else {
                            parentItem = parentItem[pathElt];
                        }
                   }
                 });

                return menu;
            }

            sendTo(name: string, data: Buffer, scope: any) {

                let dotIndex = name.indexOf('.');
                let scopeName = name.substring(0, dotIndex);
                let propertyName = name.substring(dotIndex + 1);
                let self = this;

                let updateFunc = function(aScope) {
                    self.$timeout(() => {
                        let setter = self.$parse(propertyName).assign;
                        setter(aScope, new Buffer(data.toString('hex'), 'hex'));
                    });
                };

                if (scope[scopeName]) {
                    updateFunc.call(null, scope[scopeName] );
                } else {
                    this.memory[name] = updateFunc;
                }

            };
    }

    cryptoCalcCommonModule.factory('SendToMenuService', ['$timeout', '$parse', function($timeout: angular.ITimeoutService,
                $parse: angular.IParseService) {
        return new SendToMenuService($timeout, $parse);
    }]);

    cryptoCalcCommonModule.filter('nodash', function() {
        return function(input) {
            input = input || '';
            return input.replace(/_/g, ' ').replace(/-/g, ' ');
        };
    });


    cryptoCalcCommonModule.directive('databox2', ['$timeout', '$compile', 'SendToMenuService',
        function($timeout: angular.ITimeoutService, $compile, sendToMenuService: ISendToMenuService) {

            function addItemToMenu(parentElt: angular.IAugmentedJQuery, key: string, item: any) {
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
                            addItemToMenu(subMenuElt.find('.dropdown-menu'), subKey, item[subKey]);
                        }
                    }
                }
            }

            function getMenuPosition(mouse, direction, scrollDir) {
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

            let typesMetadata = {
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

            return {
                restrict: 'E',
                require: ['^ngModel', '^form'],
                scope: {
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
                },
                template: function(element: angular.IAugmentedJQuery,
                    attrs: any) {

                    // widthInCols attribute
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

                },
                link: function(scope: any, element: angular.IAugmentedJQuery,
                    attrs: any, controllers: Array<any>) {

                    let ngModelCtrl: angular.INgModelController = controllers[0];
                    let formController: angular.IFormController = controllers[1];

                    // use $setOptions of 1.6 , see if need to be kept
                    (<any>ngModelCtrl).$$setOptions({ allowInvalid: true, updateOnDefault: true, debounce: 0 });

                    let databoxStyle: any = {};

                    if (attrs.rows && attrs.rows === '1') {
                        databoxStyle.resize = 'none';
                        databoxStyle.overflow = 'hidden';
                    }
                    scope.databoxStyle = databoxStyle;

                    scope.getTypeDescription = function(aType) {
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

                            let typeMetadata = (<any>typesMetadata)[scope.type];
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
                            return new buffer.Buffer('');
                        }

                        if (viewValue.typeChanged && scope.oldModelValue) {
                            let model = new buffer.Buffer(scope.oldModelValue.toString('hex'), 'hex');
                            ngModelCtrl.$modelValue = model;
                            scope.oldModelValue = model;
                            return model;
                        }

                        scope.charsNum = viewValue.encodedBuffer.length;

                        let validatingRexep = (<any>typesMetadata)[scope.type].regexp;
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
                                model = new buffer.Buffer(valAsHex, 'hex');
                            } else {
                                model = new buffer.Buffer(viewValue.encodedBuffer, viewValue.type);
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
                            ngModelCtrl.$setViewValue({ type: scope.type, encodedBuffer: scope.encodedBuffer,
                                 typeChanged: newViewElts[0] !== oldViewElts[0] });
                        }

                    });

                    ngModelCtrl.$render = function() {

                        if (!ngModelCtrl.$viewValue) {
                            ngModelCtrl.$viewValue = { type: 'hex', encodedBuffer: '' };
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
                            }).filter( (anExpr) => {
                                return anExpr !== undefined;
                            });
                        }

                        let menuTree = sendToMenuService.buildMenuTree(inclusions, exclusions);

                        _.forEach(menuTree, (value, key) => {
                             addItemToMenu(menuElt, key, value);
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


                       element.find('textarea').on('contextmenu', function(e) {

                            // return native menu if pressing control
                            if (e.ctrlKey) {
                                return;
                            }
                            let menu = $jq('#contextMenu-' + scope.name)
                                .data('invokedOn', $jq(e.target))
                                .show()
                                .css({
                                    position: 'absolute',
                                    left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
                                    top: getMenuPosition(e.clientY, 'height', 'scrollTop')
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

            };
        }]);

    cryptoCalcCommonModule.directive('pan',
        function($timeout: any, cryptolib: Cryptolib.CryptoLibStatic) {
            return {
                restrict: 'E',
                scope: {
                    'name': '@',
                    'model': '=',
                    'errorMsg': '='
                },
                template: function(element: angular.IAugmentedJQuery,
                    attrs: any) {

                    let errorHtml = element.html();
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
                        tpl += ' ng-class="' + attrs.ngClass + '"';
                    }
                    if (attrs.$attr.autofocus) {
                        tpl += ' autofocus';
                    }
                    if (attrs.$attr.required) {
                        tpl += ' required';
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

                },
                link: function(scope: any, element: angular.IAugmentedJQuery,
                    attrs: any) {


                    scope.$watch('model', function(newValue: any, oldValue: any) {
                        if (newValue === oldValue) {
                            return;
                        }
                        try {
                            if (newValue.length >= 12) {

                                let pan: Cryptolib.Banking.IPan = cryptolib.banking.createPanFromString(newValue);
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
                        scope.issuingNetwork = '';
                        scope.accountIdentifier = '';
                        scope.checkDigit = '';
                        scope.issuerIdentificationNumber = '';
                        scope.valid = '';
                    });

                }
            };
        });

    cryptoCalcCommonModule.directive('symKey',
        function($timeout: any, cryptolib: Cryptolib.CryptoLibStatic) {

            interface SymKeyScope extends angular.IScope {
                size: number;
                kcv: string;
                parity: Cryptolib.Cipher.IParityCheck;
                errorMsg: string;
                cipherAlgo: Cryptolib.Cipher.ICipherAlgo;
                model: string;
            }
            return {
                restrict: 'E',
                //replace : true,
                scope: {
                    'name': '@',
                    'label': '@',
                    'model': '=',
                    'cipherAlgo': '=',
                    'errorMsg': '='
                },
                template: function(element: angular.IAugmentedJQuery,
                    attrs: any) {

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


                },
                link: function(scope: SymKeyScope, element: angular.IAugmentedJQuery,
                    attrs: angular.IAttributes) {


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
                            scope.kcv = cryptolib.cipher.computeKcv(data, cipherAlgo, 3);
                            scope.parity = cryptolib.cipher.checkAndAdjustParity(data);
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

        });


    cryptoCalcCommonModule.directive('preventDefault',
        function() {

            return {
                link: function(scope, elem, attrs, ctrl) {

                    elem.bind('click', function(event) {
                        event.preventDefault();
                    });
                }
            };
        });

}