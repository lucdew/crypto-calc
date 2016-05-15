import {banking,pin,error} from '../../../crypto-lib/';


let bankingModule = angular.module('CryptoCalcModule.banking',[]);

bankingModule.controller('BankingController', ['$timeout', BankingController]);

function BankingController($timeout: ng.ITimeoutService) {
    this.isoPinTypes = pin.isoPinType.getAll();
    this.to = {};
    this.from = {};
    this.to.isoPinType = this.isoPinTypes[0];
    let self: any = this;

    this.activate = function($scope: ng.IScope) {

        $scope.$watch('banking.from.pinBlock', function(newValue: any, oldValue: any) {
            if (newValue) {
                self.fromIsoPinBlock(newValue);
            }

        });

        $scope.$watch('banking.from.pan', function(newValue: any, oldValue: any) {
            if (newValue && self.from.pinBlock) {
                try {

                    let iPan: banking.IPan = banking.createPanFromString(newValue);
                    if (iPan.isValid) {
                        self.fromIsoPinBlock(self.from.pinBlock, iPan.formatForIso9564Pin());
                    }

                } catch (e) {
                    return;
                }

            }

        });
    }

    this.fromIsoPinBlock = function(fromIsoPinBlock: string, pan: string) {


        if (fromIsoPinBlock) {

            try {
                let isoPin = pin.createIsoPinFromBlock(new Buffer(fromIsoPinBlock, 'hex'), pan);
                self.from.pinLength = isoPin.pin.length;
                self.from.pinType = isoPin.type;
                self.from.pin = isoPin.pin;
                return;
            } catch (e) {
                if (e instanceof error.CryptoError) {
                    let cryptoError = ( < error.CryptoError > e);
                    console.log(JSON.stringify(cryptoError));
                    if (cryptoError.code === error.PAN_MISSING) {
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

    }

    this.setIsoPinType = function(aIsoPinType: pin.IIsoPinType) {
        this.to.isoPinType = aIsoPinType;
    }


    this.toPinblock = function(form: any) {

        let isoPin: pin.IIsoPin = null;
        if (this.to.isoPinType.value === 0 || this.to.isoPinType.value === 3) {
            let iPan: banking.IPan = banking.createPanFromString(this.to.pan);
            isoPin = pin.createIsoPin(this.to.isoPinType, this.to.pin, iPan.formatForIso9564Pin());
        } else if (this.to.isoPinType.value === 1) {
            isoPin = pin.createIsoPin(this.to.isoPinType, this.to.pin, this.to.transactionId);
        } else {
            isoPin = pin.createIsoPin(this.to.isoPinType, this.to.pin);
        }

        this.to.pinBlock = isoPin.toBlock().toString('hex').toUpperCase();

    }

}

export default bankingModule.name;