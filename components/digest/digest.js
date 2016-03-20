var digestModule = angular.module('CryptoCalcModule.digest', ['CryptoCalcModule.common']);
digestModule.controller('DigestController', ['$timeout', 'cryptolib', 'SendToMenuService', DigestController]);
function DigestController($timeout, cryptolib, sendToMenuService) {
    var _this = this;
    var self = this;
    sendToMenuService.updateContext('digest', self);
    this.messageDigestTypes = cryptolib.util.values(cryptolib.messageDigest.messageDigestType);
    this.mode = 'digest';
    this.results = {};
    this.messageDigestType = this.messageDigestTypes[0];
    this.results[this.messageDigestType] = new Buffer('');
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
        self.results = {};
        if (!self.data || self.data.length === 0) {
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
            if (self.messageDigestType === 'ALL') {
                self.messageDigestTypes.forEach(function (md) {
                    self.results[md.name] = cryptolib.mac.hmac(md, key, self.data);
                });
            }
            else {
                self.results[self.messageDigestType.name] = cryptolib.mac.hmac(self.messageDigestType, key, self.data);
            }
        }
        else {
            if (self.messageDigestType === 'ALL') {
                self.messageDigestTypes.forEach(function (md) {
                    self.results[md.name] = cryptolib.messageDigest.digest(md, self.data);
                });
            }
            else {
                self.results[self.messageDigestType.name] = cryptolib.messageDigest.digest(self.messageDigestType, self.data);
            }
        }
    };
}
//# sourceMappingURL=digest.js.map