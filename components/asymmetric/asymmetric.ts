/// <reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../typings/browser/ambient/angular/index.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>
/// <reference path="../../js/cryptoCalcCommon.ts"/>

var asymmetricModule = angular.module('CryptoCalcModule.asymmetric', ['CryptoCalcModule.common']);

declare var KEYUTIL: any;
declare var KJUR: any;
declare var forge: any;
declare var $jq: any;

const BigInteger = forge.jsbn.BigInteger;

const typesMetadata = {
    'RAWPBKEY': {
        desc: 'Raw Pub Key'
    },
    'RAWPRKEY': {
        desc: 'Raw Private Key'
    },
    'X509': {
        desc: 'X509 cert or PEM Public Key'
    },
    // 'PKCS8_HEX' : {
    //         desc: 'PKCS#8 Hex'
    // },
    'PKCS8_PEM': {
        desc: 'PKCS#8 PEM'
    }
    // ,
    // 'JWK' : {
    //         desc : 'JWK'
    // }

};

const cipherAlgos = {
    'RSA-OAEP': {
        name: 'RSA-OAEP'
    },
    'RSAES-PKCS1-V1#5': {
        name: 'RSAES-PKCS1-V1_5'
    }
};


asymmetricModule.controller('AsymmetricController', ['$timeout', 'cryptolib', 'SendToMenuService', AsymmetricController])

.directive('dropzone', () => {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.on('ondragover ondragenter', (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    ( < any > event.originalEvent).dataTransfer.dropEffect = 'copy';
                });
                element.on('drop', (event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    var filesArray = ( < any > event.originalEvent).dataTransfer.files;
                    for (var i = 0; i < filesArray.length; i++) {

                        var reader = new FileReader();
                        reader.onloadend = (loadevent) => {
                            //var resultElt = document.getElementById("result");
                            //resultElt.value=reader.result;
                            //while(dropzone.firstChild) {
                            //   dropzone.removeChild(dropzone.firstChild);
                            //}
                            //var lines = reader.result.split('\n');
                            scope.$apply(() => {
                                element.text(reader.result);
                            });
                        };
                        reader.readAsText(filesArray[i]);
                    }
                });
            }
        };

    })
    .directive('resetBackground', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var executed = false;
                element.on('blur keyup change focus', () => {
                    if (!executed) {
                        element.css({
                            'background-image': 'none'
                        });
                        executed = true;
                    }
                });
            }
        };
    })
    .directive('contenteditable', ['$sce', function($sce) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return; // do nothing if no ng-model
                }
                var clearBg = () => {
                        element.css({
                            'background-image': 'none'
                        });
                    };
                    // Specify how UI should be updated
                ngModel.$render = function() {
                    // TODO: XSS sanitize
                    //element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                    element.html(ngModel.$viewValue || '');
                    if (!ngModel.$isEmpty(ngModel.$viewValue)) {
                        clearBg();
                    }
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function() {
                    scope.$evalAsync(read);
                });

                var executed = false;
                // element.on('blur keyup change focus', ()=> {
                //     if (!executed) {
                //         element.css({'background-image':'none'});
                //         executed = true;
                //     }
                // });

                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
                element.on('dragover dragenter', (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    ( < any > event.originalEvent).dataTransfer.dropEffect = 'copy';
                });
                element.on('drop', (event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    var filesArray = ( < any > event.originalEvent).dataTransfer.files;
                    for (var i = 0; i < filesArray.length; i++) {

                        var reader = new FileReader();
                        reader.onloadend = (loadevent) => {

                            element.parent().css({
                                'height': 'auto'
                            });
                            ngModel.$setViewValue(reader.result);
                            ngModel.$render();
                        };
                        reader.readAsText(filesArray[i]);
                    }
                });
            }
        };
    }])
    .directive('keyPair', function() {

        return {
            restrict: 'E',
            scope: {
                'model': '=',
                'label': '@'
            },
            template: function(element: angular.IAugmentedJQuery,
                attrs: any) {

                var types = attrs.types ? attrs.types.split(',') : Object.keys(typesMetadata);
                var tpl = `
                           <div class="container-fluid" style="padding:0">
                                <div class="row vertical-align bottom5">
                                   <div class="col-md-6 col-sm-6 noright-padding">
                                           <span class="bold">{{label}}</span>`;
                if (types) {

                    tpl += `<div class="btn-group left5 btn-group-default" data-toggle="buttons">`;
                    types.forEach(function(val: string, idx: number) {
                        tpl += `<label class="btn btn-xs btn-default`;
                        if (idx === 0) {
                            tpl += ` active `;
                        }
                        tpl += `" ng-click="toggleType($event,'${val}')">
                                                            <input type="radio" name="options" id="option1" autocomplete="off" checked>`;
                        tpl += ( < any > typesMetadata)[val].desc;
                        tpl += `</label>`;
                    });
                    tpl += `</div>`;

                }
                tpl += `</div>
                                   <div class="col-md-8 col-sm-4 noside-padding red bold"> {{errorMsg || typeErrorMsg}}</div>
                                </div>
                                        <div ng-show="model.type==='RAWPBKEY'">

                                           <div class="bottom5">
                                                <databox2 types="hex"
                                                        name="modulus" show-charsnum="false" width-in-cols="col-md-6 col-sm-8"
                                                        ng-model="model.value.modulus" rows="4" label="Modulus" required >
                                                </databox2>
                                           </div>

                                           <databox2 types="hex,int" name="exponent" width-in-cols="col-md-2 col-sm-4"
                                                        ng-model="model.value.exponent" rows="1" label="Exponent"
                                                        show-charsnum="false" show-size="false" required>
                                           </databox2>
                                        </div>

                                        <div ng-show="model.type==='RAWPRKEY'">
                                           <div class="bottom5">
                                                <databox2 types="hex" name="p" show-charsnum="false" width-in-cols="col-md-6 col-sm-8"
                                                        ng-model="model.value.p" rows="4" label="First Prime p" required >
                                                </databox2>
                                                 <databox2 types="hex" name="q" show-charsnum="false" width-in-cols="col-md-6 col-sm-8"
                                                        ng-model="model.value.q" rows="4" label="Second Prime q" required >
                                                </databox2>
                                                <databox2 types="hex,int" name="e" width-in-cols="col-md-2 col-sm-4"
                                                        ng-model="model.value.e" rows="1" label="Public Exponent e"
                                                        show-charsnum="false" show-size="false" required>
                                                </databox2>
                                           </div>
                                        </div>

                                        <div class="row vertical-align bottom5"
                                             ng-show="model.type!=='RAWPBKEY' && model.type!=='RAWPRKEY'">
                                                <div class="col-md-6 col-sm-8 noright-padding">
                                                        <div class="dropbox form-control resizable">
                                                                <div contenteditable ng-model="model.value.pem" ></div>

                                                        </div>
                                                </div>
                                        </div>

                          </div>`;
                //         <!--<textarea
                //                rows="4"
                //                ng-show="model.type!=='RAWPBKEY'"
                //                class="form-control dropbox" name="{{name}}" type="text" ng-model="model.value" rows="{{rows}}"
                //                ng-class="{'field-error': errorMsg || typeErrorMsg}"`

                //      if (attrs.$attr.autofocus) {
                //              tpl+=" autofocus";
                //      }
                //      if (attrs.$attr.required) {
                //              tpl+=" required";
                //      }

                //      tpl+=`></textarea>
                //      </div>
                //      `;
                console.log(tpl);
                return tpl;
            },
            link: function(scope: any, element: angular.IAugmentedJQuery,
                attrs: angular.IAttributes) {

                $jq('.resizable')
                    .resizable({
                        alsoResize: $jq(this).find('div')
                    });
                if (!scope.model || !scope.model.type) {
                    console.log('Resetting model');
                    scope.model = {
                        type: 'RAWPBKEY',
                        value: null
                    };
                }

                scope.toggleType = function($event: any, type: string) {
                    var oldtype = scope.type;
                    var oldvalue = scope.model;
                    scope.typeErrorMsg = '';
                    scope.model.type = type;
                };

            }
        };
    });


function extractPrivateKey(pHex: string, qHex: string, eHex: string) {

    var p = new BigInteger(pHex, 16);
    var q = new BigInteger(qHex, 16);
    var e = new BigInteger(eHex, 16);

    // ensure p is larger than q (swap them if not)
    if (p.compareTo(q) < 0) {
        throw 'Prime p is smaller than q';
    }

    // ensure p is coprime with e
    if (p.subtract(BigInteger.ONE).gcd(e)
        .compareTo(BigInteger.ONE) !== 0) {
        throw 'Prime p is not coprime with e';
    }

    // ensure q is coprime with e
    if (q.subtract(BigInteger.ONE).gcd(e)
        .compareTo(BigInteger.ONE) !== 0) {
        throw 'Prime p is not coprime with e';
    }

    // compute phi: (p - 1)(q - 1) (Euler's totient function)
    var p1 = p.subtract(BigInteger.ONE);
    var q1 = q.subtract(BigInteger.ONE);
    var phi = p1.multiply(q1);

    // ensure e and phi are coprime
    if (phi.gcd(e).compareTo(BigInteger.ONE) !== 0) {
        // phi and e aren't coprime, so generate a new p and q
        throw 'e is not coprime of phi';
    }

    // create n, ensure n is has the right number of bits
    var n = p.multiply(q);

    var d = e.modInverse(phi);

    //                  * @param n the modulus.
    //  * @param e the public exponent.
    //  * @param d the private exponent ((inverse of e) mod n).
    //  * @param p the first prime.
    //  * @param q the second prime.
    //  * @param dP exponent1 (d mod (p-1)).
    //  * @param dQ exponent2 (d mod (q-1)).
    //  * @param qInv ((inverse of q) mod p)
    return forge.pki.setRsaPrivateKey(n, e, d, p, q, d.mod(p1), d.mod(q1), q.modInverse(p));

}


function AsymmetricController($timeout: angular.ITimeoutService, cryptolib: Cryptolib.CryptoLibStatic,
        sendToMenuService: CryptoCalcModule.ISendToMenuService) {


    var self = this;


    sendToMenuService.updateContext('asymmetric', self);

    self.cipher = {};
    self.cipher.errors = {};
    self.cipher.keyPair = {
        type: 'RAWPBKEY',
        value: null
    };
    self.cipher.cipherAlgos = Object.keys(cipherAlgos);
    self.cipher.cipherAlgo = self.cipher.cipherAlgos[0];

    self.registeredModalCallback = false;

    self.cipher.askPassword = (cipherMode: boolean) => {
        self.cipher.cipherMode = cipherMode;

        if (!self.registeredModalCallback) {

            $jq('#passwordmodal').on('shown.bs.modal', function() {
                $jq('#keyPairPassword').focus();
            });
            self.registeredModalCallback = true;
        }
        $jq('#passwordmodal').modal('show');


    };

    self.cipher.savePasswordOnEnter = ($event: any, form: any) => {
        self.cipher.savePassword(form);
        $event.preventDefault();
    };

    self.cipher.savePassword = (form: any) => {
        self.cipher.errors['asymmetric.cipher.keyPair.password'] = null;
        try {
            var privateKey = forge.pki.decryptRsaPrivateKey(self.cipher.keyPair.value.pem, self.cipher.keyPair.password);

            if (null != privateKey) {
                $jq('#passwordmodal').modal('hide');
                self.cipher.privateKey = privateKey;
                self.cipher.cipher(form, self.cipher.cipherMode);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        self.cipher.errors['asymmetric.cipher.keyPair.password'] = 'Invalid password';
        form['asymmetric.cipher.keyPair.password'].$setValidity('server', false)
    };

    self.cipher.setCipherAlgo = function(cipherAlgo: string) {
        self.cipher.cipherAlgo = cipherAlgo;
    };

    self.cipher.cipher = function(form: any, cipherMode: boolean) {

        try {
            var params = {};
            var keyPair = self.cipher.keyPair;
            var pubKey = null;
            var privateKey = null;


            if (self.cipher.keyPair.type === 'RAWPBKEY') {

                var exp = new BigInteger(keyPair.value.exponent.toString('hex'), 16);

                var modulus = new BigInteger(keyPair.value.modulus.toString('hex'), 16);
                pubKey = forge.pki.setRsaPublicKey(modulus, exp);
            } else if (self.cipher.keyPair.type === 'RAWPRKEY') {
                privateKey = extractPrivateKey(keyPair.value.p.toString('hex'), keyPair.value.q.toString('hex'),
                    keyPair.value.e.toString('hex'));
                pubKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);

            } else if (self.cipher.keyPair.type === 'X509') {
                pubKey = forge.pki.publicKeyFromPem(keyPair.value);
            } else if (self.cipher.keyPair.type === 'PKCS8_PEM') {
                var rawPem = keyPair.value.pem;

                var isEncrypted = rawPem.match(/ENCRYPTED/i) != null;
                if (isEncrypted) {
                    var pemHash = cryptolib.messageDigest.digest(
                        cryptolib.messageDigest.messageDigestType.SHA1, new Buffer(rawPem)).toString('hex');
                    if (pemHash !== self.cipher.pemHash) {
                        self.cipher.privateKey = undefined;
                    }
                    self.cipher.pemHash = pemHash;
                    if (!self.cipher.privateKey) {
                        self.cipher.askPassword(cipherMode);
                        return;
                    }
                }

                privateKey = isEncrypted ? self.cipher.privateKey :
                    forge.pki.privateKeyFromPem(rawPem);

                pubKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
            }

            var fBuffer = forge.util.createBuffer(cryptolib.util.toArrayBuffer(self.cipher.data));

            var forgeResult = null;

            if (cipherMode) {
                forgeResult = pubKey.encrypt(fBuffer.getBytes(), cipherAlgos[self.cipher.cipherAlgo].scheme);
            } else {
                forgeResult = privateKey.decrypt(fBuffer.getBytes(), cipherAlgos[self.cipher.cipherAlgo].scheme);
            }
            var result = forge.util.createBuffer(forgeResult).toHex();
            self.cipher.result = new Buffer(result, 'hex');

        } catch (e) {
            console.log(e);
            return;
        }


    }



}