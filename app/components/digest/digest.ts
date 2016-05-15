import {md,util,mac} from '../../../crypto-lib/';
import {ISendToMenuService} from '../../services';

let digestModule = angular.module('CryptoCalcModule.digest',[]);

digestModule.controller('DigestController', ['$timeout', 'SendToMenuService', DigestController]);

function DigestController($timeout: ng.ITimeoutService,sendToMenuService: ISendToMenuService) {

    let self = this;

    sendToMenuService.updateContext('digest', self);

    this.messageDigestTypes = util.values(md.messageDigestType);

    this.mode = 'digest';
    this.results = {};

    this.messageDigestType = 'ALL';
    this.results[this.messageDigestType] = new Buffer('');

    this.setMessageDigestType = (aMessageDigestType: any) => {
        this.messageDigestType = aMessageDigestType;
        this.computeDigest();
    };

    this.setMode = (aMode: string) => {
        this.mode = aMode;
        this.computeDigest();
    };


    this.activate = function($scope: ng.IScope) {

        $scope.$watch('digest.data', function(newValue: any, oldValue: any) {
            if (self.lastError) {
                $timeout.cancel(self.lastError);
            }
            self.computeDigest();
        });

        $scope.$watch('digest.key', function(newValue: any, oldValue: any) {
            if (self.lastError) {
                $timeout.cancel(self.lastError);
            }
            self.computeDigest();
        });
    };

    self.resetResult = () => {
        self.lastError = $timeout(() => {
            this.result = '';
        }, 200);
    };


    this.computeDigest = function(digestData: Buffer, digestKey: Buffer) {
        let data: Buffer;
        let key: Buffer;
        self.results = {};
        if (!self.data || self.data.length === 0) {
            return;
        }

        if (self.mode === 'hmac') {
            try {
                key = new Buffer(self.key, self.keyType);
            } catch (e) {
                // Component alreay reports format errors
                self.resetResult();
                return;
            }
            if (self.messageDigestType === 'ALL') {
                self.messageDigestTypes.forEach(md => {
                    self.results[md.name] = mac.hmac(md, key, self.data);
                });
            } else {
                self.results[self.messageDigestType.name] = mac.hmac(self.messageDigestType, key, self.data);
            }

        } else {
            if (self.messageDigestType === 'ALL') {
                self.messageDigestTypes.forEach(aMd => {
                    self.results[aMd.name] = md.digest(aMd, self.data);
                });
            } else {
                self.results[self.messageDigestType.name] = md.digest(self.messageDigestType, self.data);
            }
        }
    };
}


export default digestModule.name;