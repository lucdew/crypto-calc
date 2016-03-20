var bankingModule = angular.module('CryptoCalcModule.banking', ['CryptoCalcModule.common']);
bankingModule.controller('BankingController', ['$timeout', 'cryptolib', BankingController]);
function BankingController($timeout, cryptolib) {
    this.isoPinTypes = cryptolib.pin.isoPinType.getAll();
    this.to = {};
    this.from = {};
    this.to.isoPinType = this.isoPinTypes[0];
    var self = this;
    this.activate = function ($scope) {
        $scope.$watch('banking.from.pinBlock', function (newValue, oldValue) {
            if (newValue) {
                self.fromIsoPinBlock(newValue);
            }
        });
        $scope.$watch('banking.from.pan', function (newValue, oldValue) {
            if (newValue && self.from.pinBlock) {
                try {
                    var iPan = cryptolib.banking.createPanFromString(newValue);
                    if (iPan.isValid) {
                        self.fromIsoPinBlock(self.from.pinBlock, iPan.formatForIso9564Pin());
                    }
                }
                catch (e) {
                    return;
                }
            }
        });
    };
    this.fromIsoPinBlock = function (fromIsoPinBlock, pan) {
        if (fromIsoPinBlock) {
            try {
                var isoPin = cryptolib.pin.createIsoPinFromBlock(new Buffer(fromIsoPinBlock, 'hex'), pan);
                self.from.pinLength = isoPin.pin.length;
                self.from.pinType = isoPin.type;
                self.from.pin = isoPin.pin;
                return;
            }
            catch (e) {
                if (e instanceof cryptolib.error.CryptoError) {
                    var cryptoError = e;
                    console.log(JSON.stringify(cryptoError));
                    if (cryptoError.code === cryptolib.error.PAN_MISSING) {
                        self.from.pinType = cryptoError.additionalInfo.pinType;
                        self.from.pinLength = cryptoError.additionalInfo.pinLength;
                        return;
                    }
                }
            }
        }
        self.from.pinType = '';
        self.from.pinLength = '';
        self.from.pan = '';
        self.from.pin = '';
    };
    this.setIsoPinType = function (aIsoPinType) {
        this.to.isoPinType = aIsoPinType;
    };
    this.toPinblock = function (form) {
        var isoPin = null;
        if (this.to.isoPinType.value === 0 || this.to.isoPinType.value === 3) {
            var iPan = cryptolib.banking.createPanFromString(this.to.pan);
            isoPin = cryptolib.pin.createIsoPin(this.to.isoPinType, this.to.pin, iPan.formatForIso9564Pin());
        }
        else if (this.to.isoPinType.value === 1) {
            isoPin = cryptolib.pin.createIsoPin(this.to.isoPinType, this.to.pin, this.to.transactionId);
        }
        else {
            isoPin = cryptolib.pin.createIsoPin(this.to.isoPinType, this.to.pin);
        }
        this.to.pinBlock = isoPin.toBlock().toString('hex').toUpperCase();
    };
}
//# sourceMappingURL=banking.js.map