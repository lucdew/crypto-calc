/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>
var asymmetricModule = angular.module('CryptoCalcModule.asymmetric', ['CryptoCalcModule.common']);
var BigInteger = forge.jsbn.BigInteger;
var typesMetadata = {
    'RAWPBKEY': {
        desc: 'Raw Pub Key'
    },
    'RAWPRKEY': {
        desc: 'Raw Private Key'
    },
    'X509': {
        desc: 'X509 cert or PEM Public Key'
    },
    'PKCS8_PEM': {
        desc: 'PKCS#8 PEM'
    }
};
asymmetricModule.controller('AsymmetricController', ['$timeout', 'cryptolib', AsymmetricController])
    .directive('dropzone', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('ondragover ondragenter', function (event) {
                event.stopPropagation();
                event.preventDefault();
                event.originalEvent.dataTransfer.dropEffect = 'copy';
            });
            element.on('drop', function (event) {
                event.stopPropagation();
                event.preventDefault();
                var filesArray = event.originalEvent.dataTransfer.files;
                for (var i = 0; i < filesArray.length; i++) {
                    var reader = new FileReader();
                    reader.onloadend = function (loadevent) {
                        scope.$apply(function () {
                            element.text(reader.result);
                        });
                    };
                    reader.readAsText(filesArray[i]);
                }
            });
        }
    };
})
    .directive('resetBackground', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var executed = false;
            element.on('blur keyup change focus', function () {
                if (!executed) {
                    element.css({ 'background-image': 'none' });
                    executed = true;
                }
            });
        }
    };
})
    .directive('contenteditable', ['$sce', function ($sce) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel)
                    return;
                var clearBg = function () {
                    element.css({ 'background-image': 'none' });
                };
                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || '');
                    if (!ngModel.$isEmpty(ngModel.$viewValue)) {
                        clearBg();
                    }
                };
                element.on('blur keyup change', function () {
                    scope.$evalAsync(read);
                });
                var executed = false;
                read();
                function read() {
                    var html = element.html();
                    if (attrs.stripBr && html == '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
                element.on('dragover dragenter', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    event.originalEvent.dataTransfer.dropEffect = 'copy';
                });
                element.on('drop', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    var filesArray = event.originalEvent.dataTransfer.files;
                    for (var i = 0; i < filesArray.length; i++) {
                        var reader = new FileReader();
                        reader.onloadend = function (loadevent) {
                            element.parent().css({ 'height': 'auto' });
                            ngModel.$setViewValue(reader.result);
                            ngModel.$render();
                        };
                        reader.readAsText(filesArray[i]);
                    }
                });
            }
        };
    }])
    .directive('keyPair', function () {
    return {
        restrict: 'E',
        scope: {
            'model': '=',
            'label': '@'
        },
        template: function (element, attrs) {
            var types = attrs.types ? attrs.types.split(',') : Object.keys(typesMetadata);
            var tpl = "\n                           <div class=\"container-fluid\" style=\"padding:0\">\n                                <div class=\"row vertical-align bottom5\">                                   \n                                   <div class=\"col-md-6 col-sm-6 noright-padding\">\n                                           <span class=\"bold\">{{label}}</span>";
            if (types) {
                tpl += "<div class=\"btn-group left5 btn-group-default\" data-toggle=\"buttons\">";
                types.forEach(function (val, idx) {
                    tpl += "<label class=\"btn btn-xs btn-default";
                    if (idx == 0) {
                        tpl += " active ";
                    }
                    tpl += "\" ng-click=\"toggleType($event,'" + val + "')\">\n                                                            <input type=\"radio\" name=\"options\" id=\"option1\" autocomplete=\"off\" checked>";
                    tpl += typesMetadata[val].desc;
                    tpl += "</label>";
                });
                tpl += "</div>";
            }
            tpl += "</div>    \n                                   <div class=\"col-md-8 col-sm-4 noside-padding red bold\"> {{errorMsg || typeErrorMsg}}</div>\n                                </div>\n                                \n\n                                        <div ng-show=\"model.type==='RAWPBKEY'\">\n                                                \n                                           <div class=\"bottom5\">\n                                                <databox types=\"hex\" name=\"modulus\" show-chars-num=\"false\" width-in-cols=\"col-md-6 col-sm-8\"\n                                                        model=\"model.value.modulus\" rows=\"4\" label=\"Modulus\" required >\n                                                </databox>\n                                           </div>\n                                                \n                                           <databox types=\"hex,int\" name=\"exponent\" width-in-cols=\"col-md-2 col-sm-4\"\n                                                        model=\"model.value.exponent\" rows=\"1\" label=\"Exponent\"  show-chars-num=\"false\" show-size=\"false\" required>\n                                           </databox>\n                                        </div>\n                                        \n                                        <div ng-show=\"model.type==='RAWPRKEY'\">\n                                           <div class=\"bottom5\">\n                                                <databox types=\"hex\" name=\"p\" show-chars-num=\"false\" width-in-cols=\"col-md-6 col-sm-8\"\n                                                        model=\"model.value.p\" rows=\"4\" label=\"First Prime p\" required >\n                                                </databox>\n                                                 <databox types=\"hex\" name=\"q\" show-chars-num=\"false\" width-in-cols=\"col-md-6 col-sm-8\"\n                                                        model=\"model.value.q\" rows=\"4\" label=\"Second Prime q\" required >\n                                                </databox>\n                                                <databox types=\"hex,int\" name=\"e\" width-in-cols=\"col-md-2 col-sm-4\"\n                                                        model=\"model.value.e\" rows=\"1\" label=\"Public Exponent e\"  \n                                                        show-chars-num=\"false\" show-size=\"false\" required>\n                                                </databox>                                                                                             \n                                           </div>\n                                        </div>\n                                        \n                                        <div class=\"row vertical-align bottom5\" ng-show=\"model.type!=='RAWPBKEY' && model.type!=='RAWPRKEY'\">                                   \n                                                <div class=\"col-md-6 col-sm-8 noright-padding\">\n                                                        <div class=\"dropbox form-control resizable\">\n                                                                <div contenteditable ng-model=\"model.value\" ></div>\n\n                                                        </div>\n                                                </div>\n                                        </div>\n                               \n                          </div>";
            console.log(tpl);
            return tpl;
        },
        link: function (scope, element, attrs) {
            $jq('.resizable')
                .resizable({
                alsoResize: $jq(this).find('div')
            });
            if (!scope.model || !scope.model.type) {
                console.log('Resetting model');
                scope.model = { type: 'RAWPBKEY', value: null };
            }
            scope.toggleType = function ($event, type) {
                var oldtype = scope.type;
                var oldvalue = scope.model;
                scope.typeErrorMsg = '';
                scope.model.type = type;
            };
        }
    };
});
function extractPrivateKey(pHex, qHex, eHex) {
    var p = new BigInteger(pHex, 16);
    var q = new BigInteger(qHex, 16);
    var e = new BigInteger(eHex, 16);
    if (p.compareTo(q) < 0) {
        throw "Prime p is smaller than q";
    }
    if (p.subtract(BigInteger.ONE).gcd(e)
        .compareTo(BigInteger.ONE) !== 0) {
        throw "Prime p is not coprime with e";
    }
    if (q.subtract(BigInteger.ONE).gcd(e)
        .compareTo(BigInteger.ONE) !== 0) {
        throw "Prime p is not coprime with e";
    }
    var p1 = p.subtract(BigInteger.ONE);
    var q1 = q.subtract(BigInteger.ONE);
    var phi = p1.multiply(q1);
    if (phi.gcd(e).compareTo(BigInteger.ONE) !== 0) {
        throw "e is not coprime of phi";
    }
    var n = p.multiply(q);
    var d = e.modInverse(phi);
    return forge.pki.setRsaPrivateKey(n, e, d, p, q, d.mod(p1), d.mod(q1), q.modInverse(p));
}
function AsymmetricController($timeout, cryptolib) {
    var self = this;
    self.cipher = {};
    self.cipher.errors = {};
    self.cipher.keyPair = { type: 'RAWPBKEY', value: null };
    self.cipher.cipherAlgos = ['RSAES-PKCS1-V1#5', 'RSA-OAEP'];
    self.cipher.cipherAlgo = 'RSAES-PKCS1-V1#5';
    self.registeredModalCallback = false;
    self.cipher.askPassword = function (cipherMode) {
        self.cipher.cipherMode = cipherMode;
        if (!self.registeredModalCallback) {
            $jq('#passwordmodal').on('shown.bs.modal', function () {
                $jq('#keyPairPassword').focus();
            });
            self.registeredModalCallback = true;
        }
        $jq('#passwordmodal').modal('show');
    };
    self.cipher.savePasswordOnEnter = function ($event, form) {
        self.cipher.savePassword(form);
        $event.preventDefault();
    };
    self.cipher.savePassword = function (form) {
        self.cipher.errors['asymmetric.cipher.keyPair.password'] = null;
        try {
            var privateKey = forge.pki.decryptRsaPrivateKey(self.cipher.keyPair.value, self.cipher.keyPair.password);
            if (null != privateKey) {
                $jq('#passwordmodal').modal('hide');
                self.cipher.cipher(form, self.cipher.cipherMode);
                return;
            }
        }
        catch (e) {
        }
        self.cipher.errors['asymmetric.cipher.keyPair.password'] = 'Invalid password';
        console.log("updated error");
        form['asymmetric.cipher.keyPair.password'].$setValidity('server', false);
    };
    self.cipher.setCipherAlgo = function (cipherAlgo) {
        self.cipher.cipherAlgo = cipherAlgo;
    };
    self.cipher.cipher = function (form, cipherMode) {
        console.log('ciphering');
        try {
            var params = {};
            var keyPair = self.cipher.keyPair;
            var pubKey = null;
            var privateKey = null;
            if (self.cipher.keyPair.type === 'RAWPBKEY') {
                var exp = new BigInteger(keyPair.value.exponent, 16);
                var modulus = new BigInteger(keyPair.value.modulus, 16);
                pubKey = forge.pki.setRsaPublicKey(modulus, exp);
            }
            else if (self.cipher.keyPair.type === 'RAWPRKEY') {
                privateKey = extractPrivateKey(keyPair.value.p, keyPair.value.q, keyPair.value.e);
                pubKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
            }
            else if (self.cipher.keyPair.type === 'X509') {
                pubKey = forge.pki.publicKeyFromPem(keyPair.value);
            }
            else if (self.cipher.keyPair.type === 'PKCS8_PEM') {
                var rawPem = keyPair.value;
                var isEncrypted = rawPem.match(/ENCRYPTED/i) != null;
                if (isEncrypted) {
                    if (!self.cipher.keyPair.password) {
                        self.cipher.askPassword(cipherMode);
                        return;
                    }
                }
                privateKey = isEncrypted ? forge.pki.decryptRsaPrivateKey(keyPair.value, self.cipher.keyPair.password) :
                    forge.pki.privateKeyFromPem(rawPem);
                pubKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
            }
            var bData = new Buffer(self.cipher.data, self.cipher.dataType);
            var fBuffer = forge.util.createBuffer(cryptolib.util.toArrayBuffer(bData));
            var forgeResult = null;
            if (cipherMode) {
                forgeResult = pubKey.encrypt(fBuffer.getBytes(), self.cipher.cipherAlgo);
            }
            else {
                forgeResult = privateKey.decrypt(fBuffer.getBytes(), self.cipher.cipherAlgo);
            }
            var result = forge.util.createBuffer(forgeResult).toHex();
            self.cipher.result = new Buffer(result, 'hex').toString(self.cipher.resultType);
        }
        catch (e) {
            console.log(e);
            return;
        }
    };
}
//# sourceMappingURL=asymmetric.js.map