import {cipher,util,padding,random,error} from '../../../crypto-lib/';
import {ISendToMenuService} from '../../services';

let symEncryptModule = angular.module('CryptoCalcModule.symencrypt',[]);


symEncryptModule.controller('SymencryptController', ['$timeout', 'SendToMenuService', SymencryptController]);


function SymencryptController($timeout: angular.ITimeoutService, sendToMenuService: ISendToMenuService, $scope) {

    let self = this;


    sendToMenuService.updateContext( 'symencrypt', self);


    $timeout(() => {
        self.errors = {};
        self.cipherAlgos = util.values(cipher.cipherAlgo);
        self.setCipherAlgo(self.cipherAlgos[0]);
        self.paddingTypes = util.values(padding);
        self.padding = self.paddingTypes[0];
    });

    self.setCipherAlgo = function(cipherAlgo: cipher.ICipherAlgo) {
        self.cipherAlgo = cipherAlgo;
        self.errors.cipherAlgo = null;
        self.blockCipherModes = util.values(cipherAlgo.modes);
        if (!self.blockCipherMode || self.blockCipherModes.indexOf(self.blockCipherMode) < 0) {
            self.setBlockCipherMode(self.blockCipherModes[0]);
        }
    };

    self.getIvForCipherMode = function(blockCipherMode: cipher.IBlockCipherMode) {
        if (!self.cipherAlgo) {
            return null;
        }
        if (self.blockCipherMode === cipher.blockCipherMode.cbc ||
            self.blockCipherMode === cipher.blockCipherMode.cfb) {
            return Array(2 * ( < cipher.ICipherAlgo > self.cipherAlgo).blockSize + 1).join('0');
        } else if (
            self.blockCipherMode === cipher.blockCipherMode.ofb ||
            self.blockCipherMode === cipher.blockCipherMode.ctr) {
            return random.generate(( < cipher.ICipherAlgo > self.cipherAlgo).blockSize).toString('hex');
        } else if (self.blockCipherMode === cipher.blockCipherMode.gcm) {
            // 12 byte nonce
            return random.generate(12).toString('hex');
        }
        return null;

    };

    self.setBlockCipherMode = (aBlockCipherMode: cipher.IBlockCipherMode) => {

        self.blockCipherMode = aBlockCipherMode;
        // Todo : only change if user did not modify the provided one already
        self.iv = self.getIvForCipherMode(self.blockCipherMode);

    };

    self.setPaddingType = function(paddingType: string) {
        self.padding = paddingType;
    };


    self.setFieldError = function(fieldName: string, msg: string) {
        self.errors[fieldName] = msg;
        self.form[fieldName].$setValidity('server', false);
    };

    self.isValidForm = function(cipherMode: boolean): boolean {
        self.errors = {};
        if (!self.data) {
            self.setFieldError('data', 'Missing data');
        }

        if (!self.key) {
            self.setFieldError('key', 'Missing key');
        } else if (self.cipherAlgo && self.cipherAlgo.keyLengths.indexOf(self.key.length * 4) === -1) {
            self.setFieldError('key', 'Invalid key length only accepted are ' + JSON.stringify(self.cipherAlgo.keyLengths));
        }

        if (!self.cipherAlgo) {
            self.setFieldError('cipherAlgo', 'Choose a cryptographic algorithm');
        }

        return !(self.errors && Object.keys(self.errors).length !== 0);

    };

    self.cipher = function(form: any, cipherMode: boolean) {
        self.submitted = true;
        self.form = form;
        self.result = {};


        if (!self.isValidForm(cipherMode)) {
            return;
        }

        try {
            let bKey = new Buffer(self.key, 'hex');
            let cipherOpts: any = {
                padding: self.padding,
                iv: self.iv
            };
            if (self.blockCipherMode === cipher.blockCipherMode.gcm) {
                cipherOpts.additionalAuthenticatedData = self.aad;
            }
            let cipherResult: cipher.ICipherResult = null;
            if (cipherMode) {
                cipherResult = cipher.cipher(bKey, self.data,
                    self.cipherAlgo, self.blockCipherMode, cipherOpts);
            } else {
                if (self.blockCipherMode === cipher.blockCipherMode.gcm) {
                    cipherOpts.authenticationTag = self.authTag;
                }
                cipherResult = cipher.decipher(bKey, self.data,
                    self.cipherAlgo, self.blockCipherMode, cipherOpts);
            }
            self.result.data = cipherResult.data;
            if (cipherMode && self.blockCipherMode === cipher.blockCipherMode.gcm) {
                self.result.authTag = cipherResult.authenticationTag;
            }
        } catch (e) {
            let msg: string;
            if (e instanceof error.CryptoError) {
                let cryptoError = ( < error.CryptoError > e);
                msg = cryptoError.message || cryptoError.code.description;
                if (cryptoError.code === error.AUTHENTICATED_TAG_INVALID) {
                    self.errors.authTag = 'Invalid';
                }
            } else {
                msg = e.message;
            }
            msg = msg || 'Unexpected error';
            self.errors.result = msg;
        }

    }

}


export default symEncryptModule.name;