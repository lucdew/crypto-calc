angular.module('CryptoCalcModule.utils', ['CryptoCalcModule.common'])
    .controller('UtilsBitwiseController', ['cryptolib', 'SendToMenuService', BitwiseController])
    .controller('UtilsEncodingController', [EncodingController]);
function EncodingController() {
}
function BitwiseController(cryptolib, sendToMenuService) {
    var _this = this;
    this.bitwiseOperators = [{
            name: 'XOR',
            func: cryptolib.util.xor
        }, {
            name: 'AND',
            func: cryptolib.util.and
        }, {
            name: 'OR',
            func: cryptolib.util.or
        }, {
            name: 'NOT',
            func: cryptolib.util.not
        }];
    this.bitwiseOperator = this.bitwiseOperators[0];
    this.dataList = [{
            value: new Buffer('')
        }, {
            value: new Buffer('')
        }];
    sendToMenuService.updateContext('bitwise', this);
    this.setBitwiseOperator = function (aBitwiseOperator) {
        _this.bitwiseOperator = aBitwiseOperator;
    };
    this.addDataElt = function () {
        _this.dataList.push({
            value: new Buffer('')
        });
    };
    this.removeDataElt = function () {
        if (_this.dataList.length > 2) {
            _this.dataList.pop();
        }
    };
    this.executeBitwiseOperation = function () {
        var result;
        try {
            if (_this.bitwiseOperator.name === 'NOT') {
                result = _this.bitwiseOperator.func.call(null, _this.dataList[0]);
            }
            else {
                result = _this.dataList[0].value;
                for (var idx = 1; idx < _this.dataList.length; idx++) {
                    console.log(_this.dataList[idx].value.toString('hex'));
                    result = _this.bitwiseOperator.func.call(null, result, _this.dataList[idx].value);
                }
            }
            _this.result = result;
        }
        catch (err) {
            console.log(err);
        }
    };
}
//# sourceMappingURL=utils.js.map