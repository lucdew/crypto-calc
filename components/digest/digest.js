var digestModule = angular.module('CryptoCalcModule.digest', ['CryptoCalcModule.common']);
digestModule.controller('DigestController', ['$timeout', 'cryptolib', DigestController]);
function DigestController($timeout, cryptolib) {
    var _this = this;
    var self = this;
    this.messageDigestTypes = cryptolib.util.values(cryptolib.messageDigest.messageDigestType);
    this.mode = 'digest';
    this.messageDigestType = this.messageDigestTypes[0];
    this.setMessageDigestType = function (aMessageDigestType) {
        _this.messageDigestType = aMessageDigestType;
        _this.computeDigest();
    };
    this.setMode = function (aMode) {
        _this.mode = aMode;
        _this.computeDigest();
    };
    this.activate = function ($scope) {
        $scope.$watch('digest.data', function (newValue, oldValue) {
            if (self.lastError) {
                $timeout.cancel(self.lastError);
            }
            self.computeDigest();
        });
        $scope.$watch('digest.key', function (newValue, oldValue) {
            if (self.lastError) {
                $timeout.cancel(self.lastError);
            }
            self.computeDigest();
        });
    };
    self.resetResult = function () {
        self.lastError = $timeout(function () {
            _this.result = '';
        }, 200);
    };
    this.computeDigest = function (digestData, digestKey) {
        var data;
        var key;
        if (!self.data) {
            self.result = '';
            return;
        }
        try {
            data = new Buffer(self.data, self.dataType);
        }
        catch (e) {
            self.resetResult();
            return;
        }
        if (self.mode === 'hmac') {
            try {
                key = new Buffer(self.key, self.keyType);
            }
            catch (e) {
                self.resetResult();
                return;
            }
            self.result = cryptolib.mac.hmac(self.messageDigestType, key, data).toString(self.resultType);
        }
        else {
            self.result = cryptolib.messageDigest.digest(self.messageDigestType, data).toString(self.resultType);
        }
    };
}
//# sourceMappingURL=digest.js.map