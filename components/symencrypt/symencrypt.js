var symEncryptModule = angular.module('CryptoCalcModule.symencrypt', ['CryptoCalcModule.common']);
symEncryptModule.controller('SymencryptController', ['$timeout', 'cryptolib', 'CryptoCalc', SymencryptController]);
function SymencryptController($timeout, cryptolib, CryptoCalc) {
    var _this = this;
    this.model = CryptoCalc.encrypt;
    $timeout(function () {
        _this.cipherAlgos = cryptolib.cipher.cipherAlgo.getAll();
        _this.blockCipherModes = cryptolib.cipher.blockCipherMode.getAll();
        _this.blockCipherMode = _this['blockCipherModes'][0];
        _this.paddingTypes = cryptolib.padding.getAll();
        _this.padding = _this['paddingTypes'][0];
    });
    this.setCipherAlgo = function (cipherAlgo) {
        this.cipherAlgo = cipherAlgo;
        this.errors['cipherAlgo'] = null;
    };
    this.setBlockCipherMode = function (blockCipherMode) {
        this.blockCipherMode = blockCipherMode;
        if (this.cipherAlgo) {
            this.iv = Array(2 * this.cipherAlgo.blockSize + 1).join("0");
        }
    };
    this.setPaddingType = function (paddingType) {
        this.padding = paddingType;
    };
    this.setFieldError = function (fieldName, msg) {
        this.errors[fieldName] = msg;
        console.log('######### Error ' + fieldName + ', msg:' + msg);
    };
    this.isValidForm = function (cipherMode) {
        this.errors = {};
        if (!this.data) {
            this.setFieldError('data', 'Missing data');
        }
        else if (this.data.length % 2 !== 0) {
            this.setFieldError('data', 'Invalid hexa data');
        }
        if (!this.key) {
            this.setFieldError('key', 'Missing key');
        }
        else if (this.cipherAlgo && this.cipherAlgo.keyLengths.indexOf(this.key.length * 4) === -1) {
            this.setFieldError('key', 'Invalid key length only accepted are ' + JSON.stringify(this.cipherAlgo.keyLengths));
        }
        if (!this.cipherAlgo) {
            this.setFieldError('cipherAlgo', 'Choose a cryptographic algorithm');
        }
        if (this.iv && !this.blockCipherMode.hasIV) {
            this.setFieldError('IV', 'IV shall not be set for the block cipher Mode');
        }
        return true;
    };
    this.cipher = function (form, cipherMode) {
        this.submitted = true;
        this.form = form;
        if (!this.isValidForm(cipherMode)) {
            return;
        }
        try {
            var aCipher = cryptolib.cipher.createCipher(this.cipherAlgo, this.blockCipherMode, this.padding);
            var ivBuffer = null;
            if (this.iv) {
                ivBuffer = new Buffer(this.iv, 'hex');
            }
            aCipher.init(new Buffer(this.key, 'hex'), cipherMode, ivBuffer);
            var resBuffer = aCipher.finish(new Buffer(this.data, 'hex'));
            this.result = resBuffer.toString('hex').toUpperCase();
        }
        catch (e) {
            console.log(JSON.stringify(e));
        }
    };
}
//# sourceMappingURL=symencrypt.js.map