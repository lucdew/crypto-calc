var symEncryptModule = angular.module('CryptoCalcModule.symencrypt', ['CryptoCalcModule.common']);
symEncryptModule.controller('SymencryptController', ['$timeout', 'cryptolib', 'CryptoCalc', SymencryptController]);
function SymencryptController($timeout, cryptolib, CryptoCalc) {
    this.model = CryptoCalc.encrypt;
    var self = this;
    $timeout(function () {
        self.errors = {};
        self.cipherAlgos = cryptolib.util.values(cryptolib.cipher.cipherAlgo);
        self.setCipherAlgo(self.cipherAlgos[0]);
        self.paddingTypes = cryptolib.util.values(cryptolib.padding);
        self.padding = self['paddingTypes'][0];
    });
    self.setCipherAlgo = function (cipherAlgo) {
        self.cipherAlgo = cipherAlgo;
        self.errors['cipherAlgo'] = null;
        self.blockCipherModes = cryptolib.util.values(cipherAlgo.modes);
        if (!self.blockCipherMode || self.blockCipherModes.indexOf(self.blockCipherMode) < 0) {
            self.setBlockCipherMode(self.blockCipherModes[0]);
        }
    };
    self.getIvForCipherMode = function (blockCipherMode) {
        if (!self.cipherAlgo) {
            return null;
        }
        if (self.blockCipherMode === cryptolib.cipher.blockCipherMode.cbc || self.blockCipherMode === cryptolib.cipher.blockCipherMode.cfb) {
            return Array(2 * self.cipherAlgo.blockSize + 1).join("0");
        }
        else if (self.blockCipherMode === cryptolib.cipher.blockCipherMode.ofb || self.blockCipherMode === cryptolib.cipher.blockCipherMode.ctr) {
            return cryptolib.random.generate(self.cipherAlgo.blockSize).toString('hex');
        }
        else if (self.blockCipherMode === cryptolib.cipher.blockCipherMode.gcm) {
            return cryptolib.random.generate(12).toString('hex');
        }
        return null;
    };
    self.setBlockCipherMode = function (aBlockCipherMode) {
        self.blockCipherMode = aBlockCipherMode;
        self.iv = self.getIvForCipherMode(self.blockCipherMode);
    };
    self.setPaddingType = function (paddingType) {
        self.padding = paddingType;
    };
    self.setFieldError = function (fieldName, msg) {
        self.errors[fieldName] = msg;
        self.form[fieldName].$setValidity('server', false);
    };
    self.isValidForm = function (cipherMode) {
        self.errors = {};
        if (!self.data) {
            self.setFieldError('data', 'Missing data');
        }
        if (!self.key) {
            self.setFieldError('key', 'Missing key');
        }
        else if (self.cipherAlgo && self.cipherAlgo.keyLengths.indexOf(self.key.length * 4) === -1) {
            self.setFieldError('key', 'Invalid key length only accepted are ' + JSON.stringify(self.cipherAlgo.keyLengths));
        }
        if (!self.cipherAlgo) {
            self.setFieldError('cipherAlgo', 'Choose a cryptographic algorithm');
        }
        return !(self.errors && Object.keys(self.errors).length != 0);
    };
    self.cipher = function (form, cipherMode) {
        self.submitted = true;
        self.form = form;
        self.result = {};
        if (!self.isValidForm(cipherMode)) {
            return;
        }
        try {
            var ivBuffer = null;
            if (self.iv) {
                ivBuffer = new Buffer(self.iv, 'hex');
            }
            var bKey = new Buffer(self.key, 'hex');
            var bData = new Buffer(self.data, self.datatype);
            var cipherOpts = { padding: self.padding, iv: ivBuffer };
            if (self.blockCipherMode === cryptolib.cipher.blockCipherMode.gcm) {
                cipherOpts.additionalAuthenticatedData = new Buffer(self.aad, self.aadtype);
            }
            var cipherResult = null;
            if (cipherMode) {
                cipherResult = cryptolib.cipher.cipher(bKey, bData, self.cipherAlgo, self.blockCipherMode, cipherOpts);
            }
            else {
                if (self.blockCipherMode === cryptolib.cipher.blockCipherMode.gcm) {
                    cipherOpts.authenticationTag = new Buffer(self.authTag, 'hex');
                }
                cipherResult = cryptolib.cipher.decipher(bKey, bData, self.cipherAlgo, self.blockCipherMode, cipherOpts);
            }
            self.result.data = cipherResult.data.toString(self.resulttype);
            if (cipherMode && self.blockCipherMode === cryptolib.cipher.blockCipherMode.gcm) {
                self.result.authTag = cipherResult.authenticationTag.toString('hex');
            }
        }
        catch (e) {
            var msg;
            if (e instanceof cryptolib.error.CryptoError) {
                var cryptoError = e;
                msg = cryptoError.message || cryptoError.code.description;
                if (cryptoError.code === cryptolib.error.AUTHENTICATED_TAG_INVALID) {
                    self.setFieldError('authTag', 'Invalid');
                }
            }
            else {
                msg = e.message;
            }
            msg = msg || 'Unexpected error';
            self.errors['result'] = msg;
        }
    };
}
//# sourceMappingURL=symencrypt.js.map