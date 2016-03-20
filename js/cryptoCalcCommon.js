var CryptoCalcModule;
(function (CryptoCalcModule) {
    var cryptoCalcCommonModule = angular.module('CryptoCalcModule.common', ['ngAnimate']);
    cryptoCalcCommonModule.factory('cryptolib', function () {
        return window.cryptolib;
    });
    var SendToMenuService = (function () {
        function SendToMenuService($timeout, $parse) {
            this.items = {};
            this.memory = {};
            this.$timeout = $timeout;
            this.$parse = $parse;
        }
        SendToMenuService.prototype.updateContext = function (contextName, context) {
            var _this = this;
            _.forOwn(this.memory, function (cb, propName) {
                if (propName.indexOf(contextName) !== 0) {
                    return;
                }
                cb.call(null, context);
                delete _this.memory[propName];
            });
        };
        SendToMenuService.prototype.registerMenuItem = function (menuItemName, menuPath) {
            this.items[menuItemName] = { menuPath: menuPath };
        };
        ;
        SendToMenuService.prototype.buildMenuTree = function (inclusions, exclusions) {
            var filteredMenuItems = _(this.items).pickBy(function (value, key) {
                return !inclusions || inclusions.length === 0 ||
                    _.find(inclusions, function (elt) { return _.startsWith(key, elt); }) !== undefined;
            }).pickBy(function (value, key) {
                return !exclusions || exclusions.length === 0 ||
                    _.find(exclusions, function (elt) { return _.startsWith(key, elt); }) === undefined;
            }).value();
            var menu = {};
            _.forEach(this.items, function (value, key) {
                var parentItem = menu;
                var pathElts = value.menuPath.split('.');
                for (var idx = 0; idx < pathElts.length; idx++) {
                    var pathElt = pathElts[idx];
                    if (!parentItem[pathElt]) {
                        parentItem[pathElt] = {};
                    }
                    if (idx === pathElts.length - 1) {
                        parentItem[pathElt] = key;
                    }
                    else {
                        parentItem = parentItem[pathElt];
                    }
                }
            });
            return menu;
        };
        SendToMenuService.prototype.sendTo = function (name, data, scope) {
            var dotIndex = name.indexOf('.');
            var scopeName = name.substring(0, dotIndex);
            var propertyName = name.substring(dotIndex + 1);
            var self = this;
            var updateFunc = function (aScope) {
                self.$timeout(function () {
                    var setter = self.$parse(propertyName).assign;
                    setter(aScope, new Buffer(data.toString('hex'), 'hex'));
                });
            };
            if (scope[scopeName]) {
                updateFunc.call(null, scope[scopeName]);
            }
            else {
                this.memory[name] = updateFunc;
            }
        };
        ;
        return SendToMenuService;
    }());
    cryptoCalcCommonModule.factory('SendToMenuService', ['$timeout', '$parse', function ($timeout, $parse) {
            return new SendToMenuService($timeout, $parse);
        }]);
    cryptoCalcCommonModule.filter('nodash', function () {
        return function (input) {
            input = input || '';
            return input.replace(/_/g, ' ').replace(/-/g, ' ');
        };
    });
    cryptoCalcCommonModule.directive('databox2', ['$timeout', '$compile', 'SendToMenuService',
        function ($timeout, $compile, sendToMenuService) {
            function addItemToMenu(parentElt, key, item) {
                if (angular.isString(item)) {
                    parentElt.append("<li class=\"menu-item\"><a tabindex=\"-1\" href=\"#\"\n                    ng-click=\"sendToData($event,'" + item + "')\">" + key + "</a></li>");
                }
                else {
                    var subMenuElt = angular.element(" <li class=\"menu-item dropdown dropdown-submenu\">\n                                        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" on>" + key + "</a>\n                                        <ul class=\"dropdown-menu\"/>\n                                    </li>");
                    parentElt.append(subMenuElt);
                    for (var subKey in item) {
                        if (item.hasOwnProperty(subKey)) {
                            addItemToMenu(subMenuElt.find('.dropdown-menu'), subKey, item[subKey]);
                        }
                    }
                }
            }
            function getMenuPosition(mouse, direction, scrollDir) {
                var win = $jq(window)[direction](), scroll = $jq(window)[scrollDir](), menu = $jq('#contextMenu')[direction](), position = mouse + scroll;
                if (mouse + menu > win && menu < mouse) {
                    position -= menu;
                }
                return position;
            }
            var typesMetadata = {
                hex: {
                    desc: 'Hexa',
                    regexp: /^(\s*[0-9a-fA-F][0-9a-fA-F]\s*)+$/,
                },
                utf8: {
                    desc: 'Utf-8',
                    regexp: /[A-Za-z\u0080-\u00FF ]+/
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
                template: function (element, attrs) {
                    if (attrs.widthInCols && attrs.widthInPixels) {
                        throw 'Both attributes widthInPixels and widthInCols have been set, choose one';
                    }
                    return "\n                            <div class=\"container-fluid\" style=\"padding:0\">\n                               <div class=\"row vertical-align bottom5\">\n                                    <div class=\"col-md-2 col-sm-4 noright-padding\">\n                                           <span class=\"bold\">{{label}}</span>\n                                            <div class=\"btn-group left5 btn-group-default buttons\">\n                                                <label class=\"btn btn-xs btn-default\"\n                                                        ng-class=\"{'active': atype === $parent.type}\" ng-repeat=\"atype in types.split(',')\">\n                                                        <input type=\"radio\" autocomplete=\"off\" ng-model=\"$parent.type\" value=\"{{atype}}\">\n                                                        {{getTypeDescription(atype)}}\n                                                </label>\n                                            </div>\n                                    </div>\n                                    <div class=\"col-md-1 col-sm-2 bold noside-padding\"\n                                         ng-if=\"!showCharsnum || showCharsnum =='true'\">Chars: {{charsNum}}</div>\n                                    <div class=\"col-md-1 col-sm-2 bold noside-padding\"\n                                         ng-if=\"!showSize || showSize == 'true'\" >Size: {{size}} bytes</div>\n                                    <div class=\"col-md-8 col-sm-4 noside-padding red bold\" >{{errorMsg ||typeErrorMsg}}</div>\n                               </div>\n                               <div class=\"row vertical-align bottom5\" >\n                                    <div class=\"noright-padding\" ng-class=\"widthInCols\">\n                                        <textarea class=\"form-control\" name=\"{{name}}\" ng-model=\"encodedBuffer\" type=\"text\" rows=\"{{rows}}\"\n                                            ng-style=\"databoxStyle\"\n                                            ng-required=\"required\" ng-focus=\"autofocus\">\n                                        </textarea>\n                                    </div>\n                               </div>\n                             </div>\n                                ";
                },
                link: function (scope, element, attrs, controllers) {
                    var ngModelCtrl = controllers[0];
                    var formController = controllers[1];
                    ngModelCtrl.$$setOptions({ allowInvalid: true, updateOnDefault: true, debounce: 0 });
                    var databoxStyle = {};
                    if (attrs.rows && attrs.rows === '1') {
                        databoxStyle.resize = 'none';
                        databoxStyle.overflow = 'hidden';
                    }
                    scope.databoxStyle = databoxStyle;
                    scope.getTypeDescription = function (aType) {
                        return (aType in typesMetadata) ? typesMetadata[aType].desc : '';
                    };
                    scope.$on('$destroy', function () {
                        if (scope.lastError) {
                            $timeout.cancel(scope.lastError);
                            scope.lastError = undefined;
                        }
                    });
                    scope.setValid = function () {
                        if (scope.lastError) {
                            $timeout.cancel(scope.lastError);
                        }
                        ngModelCtrl.$setValidity('databoxData', true);
                        scope.typeErrorMsg = undefined;
                    };
                    scope.setInvalid = function () {
                        scope.lastError = $timeout(function () {
                            var typeMetadata = typesMetadata[scope.type];
                            ngModelCtrl.$setValidity('databoxData', false);
                            var typeDesc = typeMetadata.desc;
                            if (scope.type === 'hex' && scope.encodedBuffer.length % 2 !== 0) {
                                scope.typeErrorMsg = 'Invalid length for ' + typeDesc + ' string';
                            }
                            else {
                                scope.typeErrorMsg = 'Invalid characters for type ' + typeDesc;
                            }
                        }, 200);
                    };
                    ngModelCtrl.$formatters.push(function (modelValue) {
                        var type = scope.type || (scope.types ? scope.types[0] : 'hex');
                        var encodedBuffer = '';
                        if (modelValue) {
                            if (type === 'int') {
                                encodedBuffer = parseInt(modelValue.toString('hex'), 16).toString();
                            }
                            else {
                                encodedBuffer = modelValue.toString(type);
                            }
                            scope.oldModelValue = modelValue;
                        }
                        return {
                            type: type,
                            encodedBuffer: encodedBuffer,
                            size: modelValue ? modelValue.length : 0
                        };
                    });
                    ngModelCtrl.$parsers.push(function (viewValue) {
                        scope.setValid();
                        if (!viewValue || !viewValue.encodedBuffer) {
                            scope.charsNum = 0;
                            scope.size = 0;
                            return new buffer.Buffer('');
                        }
                        if (viewValue.typeChanged && scope.oldModelValue) {
                            var model_1 = new buffer.Buffer(scope.oldModelValue.toString('hex'), 'hex');
                            ngModelCtrl.$modelValue = model_1;
                            scope.oldModelValue = model_1;
                            return model_1;
                        }
                        scope.charsNum = viewValue.encodedBuffer.length;
                        var validatingRexep = typesMetadata[scope.type].regexp;
                        if (!validatingRexep.test(viewValue.encodedBuffer)) {
                            scope.setInvalid();
                            return scope.oldModelValue ? scope.oldModelValue : undefined;
                        }
                        var model;
                        try {
                            if (viewValue.type === 'int') {
                                var valAsHex = parseInt(viewValue.encodedBuffer).toString(16);
                                if (valAsHex.length % 2 !== 0) {
                                    valAsHex = '0' + valAsHex;
                                }
                                model = new buffer.Buffer(valAsHex, 'hex');
                            }
                            else {
                                model = new buffer.Buffer(viewValue.encodedBuffer, viewValue.type);
                            }
                            scope.size = model.length;
                            scope.oldModelValue = model;
                            return model;
                        }
                        catch (e) {
                            scope.size = 0;
                            scope.setInvalid();
                            return scope.oldModelValue ? scope.oldModelValue : undefined;
                        }
                    });
                    scope.$watch('type + "#" +encodedBuffer', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            var newViewElts = newValue.split('#');
                            var oldViewElts = oldValue.split('#');
                            ngModelCtrl.$setViewValue({ type: scope.type, encodedBuffer: scope.encodedBuffer,
                                typeChanged: newViewElts[0] !== oldViewElts[0] });
                        }
                    });
                    ngModelCtrl.$render = function () {
                        if (!ngModelCtrl.$viewValue) {
                            ngModelCtrl.$viewValue = { type: 'hex', encodedBuffer: '' };
                        }
                        scope.type = ngModelCtrl.$viewValue.type;
                        scope.encodedBuffer = ngModelCtrl.$viewValue.encodedBuffer;
                        scope.size = ngModelCtrl.$viewValue.size;
                        scope.charsNum = ngModelCtrl.$viewValue.encodedBuffer.length;
                    };
                    if ('withMenu' in attrs.$attr) {
                        var menuElt_1 = angular.element("<ul id=\"contextMenu-" + scope.name + "\" class=\"dropdown-menu\"\n                                                        role=\"menu\" style=\"display:none\" />");
                        var inclusions = [], exclusions = [];
                        if (attrs.$attr.withMenu && typeof attrs.$attr.withMenu === 'string' && attrs.$attr.withMenu.length > 0) {
                            var menuExprs = attrs.$attr.withMenu.split(',');
                            inclusions = _.map(menuExprs, function (anExpr) {
                                var regRes = /\s*\+(.+)/.exec(anExpr);
                                return regRes && regRes.length === 1 ? regRes[1] : undefined;
                            }).filter(function (anExpr) {
                                return anExpr !== undefined;
                            });
                            exclusions = _.map(menuExprs, function (anExpr) {
                                var regRes = /\s*-(.+)/.exec(anExpr);
                                return regRes && regRes.length === 1 ? regRes[1] : undefined;
                            }).filter(function (anExpr) {
                                return anExpr !== undefined;
                            });
                        }
                        var menuTree = sendToMenuService.buildMenuTree(inclusions, exclusions);
                        _.forEach(menuTree, function (value, key) {
                            addItemToMenu(menuElt_1, key, value);
                        });
                        var textAreaEl = element.find('textarea').clone();
                        menuElt_1 = $compile(menuElt_1)(scope);
                        element.append(menuElt_1);
                        $jq(document).click(function (e) {
                            menuElt_1.hide();
                        });
                        scope.sendToData = function ($event, path) {
                            sendToMenuService.sendTo(path, scope.oldModelValue, scope.$parent);
                            $event.preventDefault();
                        };
                        element.find('textarea').on('contextmenu', function (e) {
                            if (e.ctrlKey) {
                                return;
                            }
                            var menu = $jq('#contextMenu-' + scope.name)
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
                    }
                    if (attrs.types) {
                        scope.type = attrs.types.split(',')[0];
                    }
                }
            };
        }]);
    cryptoCalcCommonModule.directive('pan', function ($timeout, cryptolib) {
        return {
            restrict: 'E',
            scope: {
                'name': '@',
                'model': '=',
                'errorMsg': '='
            },
            template: function (element, attrs) {
                var errorHtml = element.html();
                var tpl = "\n                           <div class=\"container-fluid\">\n                                <div class=\"row\">\n                                   <div class=\"col-md-3 col-sm-3 noside-padding red\"> {{errorMsg}}</div>\n                                </div>\n                                <div class=\"row\">\n\n                                 <div class=\"col-md-2 col-sm-4 noside-padding\">\n\n                                <input class=\"form-control\" style=\"width:170px\" maxlength=\"19\"\n                                       size=\"19\" name=\"{{name}}\" type=\"text\" ng-model=\"model\"";
                if (attrs.ngClass) {
                    tpl += ' ng-class="' + attrs.ngClass + '"';
                }
                if (attrs.$attr.autofocus) {
                    tpl += ' autofocus';
                }
                if (attrs.$attr.required) {
                    tpl += ' required';
                }
                tpl += ">\n                             </div>\n\n\n                                  <div class=\"col-md-3 col-sm-4 noside-padding\" style=\"font-size:11px\">\n                                      <div class=\"bold\">Issuing Network : {{issuingNetwork}}</div>\n                                      <div class=\"bold\" >Check digit: <span ng-show=\"valid\" >{{checkDigit}}</span></div>\n\n                                   </div>\n                                   <div class=\"col-md-2 col-sm-4 noside-padding\" style=\"font-size:11px\">\n                                        <div class=\"bold\">Account Id: {{accountIdentifier}}</div>\n                                        <div class=\"bold\">Issuer Id: {{issuerIdentificationNumber}}</div>\n                             </div>\n                             </div>";
                return tpl;
            },
            link: function (scope, element, attrs) {
                scope.$watch('model', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    try {
                        if (newValue.length >= 12) {
                            var pan = cryptolib.banking.createPanFromString(newValue);
                            scope.issuingNetwork = pan.issuingNetwork.name;
                            scope.accountIdentifier = pan.individualAccountIdentifier;
                            scope.issuerIdentificationNumber = pan.issuerIdentificationNumber;
                            scope.checkDigit = pan.checkDigit;
                            scope.valid = pan.isValid();
                            return;
                        }
                    }
                    catch (e) {
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
    cryptoCalcCommonModule.directive('symKey', function ($timeout, cryptolib) {
        return {
            restrict: 'E',
            scope: {
                'name': '@',
                'label': '@',
                'model': '=',
                'cipherAlgo': '=',
                'errorMsg': '='
            },
            template: function (element, attrs) {
                var tpl = "\n                           <div class=\"container-fluid noside-padding\">\n                                <div class=\"row\">\n                                   <div class=\"col-md-1 col-sm-2 bold noright-padding\">{{label}}</div>\n                                   <div class=\"col-md-2 col-sm-2 bold noside-padding\">KCV: {{kcv}}</div>\n                                   <div class=\"col-md-2 col-sm-2 bold noside-padding\">Size: {{size}} bits</div>\n                                   <div class=\"col-md-3 col-sm-4 bold noside-padding\">\n                                        <span ng-show=\"cipherAlgo.name=='DES' || cipherAlgo.name=='3DES'\">\n                                         Parity: {{parity.valid}}<span ng-show=\"parity.adjustedKey && !(parity.valid)\">,\n                                         Adjusted: {{parity.adjustedKey.toString('hex')}}</span>\n                                        </span>\n                                   </div>\n                                   <div class=\"col-md-4 col-sm-2 bold noside-padding red\">{{errorMsg}}</div>\n\n                                </div>\n                                <input class=\"form-control\" name=\"{{name}}\" type=\"text\" ng-model=\"model\"";
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
            link: function (scope, element, attrs) {
                scope.size = 0;
                scope.kcv = '';
                scope.parity = undefined;
                function updateKeyInfo() {
                    var keySize = scope.size, cipherAlgo = scope.cipherAlgo;
                    if (typeof keySize !== 'number' || (keySize % 2) !== 0 || keySize < 64 ||
                        !cipherAlgo || cipherAlgo.keyLengths.indexOf(keySize) === -1) {
                        scope.kcv = '';
                        scope.parity = undefined;
                    }
                    try {
                        var data = new Buffer(scope.model, 'hex');
                        scope.kcv = cryptolib.cipher.computeKcv(data, cipherAlgo, 3);
                        scope.parity = cryptolib.cipher.checkAndAdjustParity(data);
                    }
                    catch (e) {
                        scope.kcv = '';
                        scope.parity = undefined;
                    }
                }
                scope.$watch('cipherAlgo', function (newValue, oldValue) {
                    updateKeyInfo();
                });
                scope.$watch('model', function (newValue, oldValue) {
                    var keySize = 0;
                    scope.errorMsg = '';
                    if (newValue && (newValue.length % 2) === 0) {
                        keySize = newValue.length * 4;
                    }
                    else {
                        keySize = 0;
                    }
                    scope.size = keySize;
                    updateKeyInfo();
                });
            }
        };
    });
    cryptoCalcCommonModule.directive('preventDefault', function () {
        return {
            link: function (scope, elem, attrs, ctrl) {
                elem.bind('click', function (event) {
                    event.preventDefault();
                });
            }
        };
    });
})(CryptoCalcModule || (CryptoCalcModule = {}));
//# sourceMappingURL=cryptoCalcCommon.js.map