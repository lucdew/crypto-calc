/// <reference path="../../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../../crypto-lib/cryptolib.d.ts"/>
angular.module('CryptoCalcModule.utils', ['CryptoCalcModule.common'])
    .controller('UtilsBitwiseController', ['cryptolib', BitwiseController])
    .controller('UtilsEncodingController', [EncodingController])
    .directive('cryptoConverter', function (cryptolib) {
    return {
        restrict: 'E',
        scope: {
            'dataToConvert': '=ngModel'
        },
        template: "\n                <div class=\"bottom7\">\n                    <databox types=\"hex\" name=\"hex\" model=\"dataToConvert.hex\" rows=\"2\" label=\"Hexa\"></databox>\n                </div>\n                <div class=\"bottom7\">\n                   <databox types=\"ascii\" name=\"ascii\" model=\"dataToConvert.ascii\" rows=\"2\" label=\"Ascii\"></databox>\n                </div>\n                <div class=\"bottom7\">\n                   <databox types=\"base64\" name=\"base64\" model=\"dataToConvert.base64\" rows=\"2\" label=\"Base64\"></databox>\n                </div>\n                <databox types=\"utf8\" name=\"utf8\" model=\"dataToConvert.utf8\" rows=\"2\" label=\"Utf8\"></databox>             \n                ",
        link: function (scope, element, attrs) {
            function convertAll(inputData, inputType) {
                var allTypes = ['hex', 'ascii', 'base64', 'utf8'];
                var convertData = {};
                var b;
                convertData[inputType] = inputData;
                try {
                    b = buffer.Buffer(inputData, inputType);
                }
                catch (e) {
                    return convertData;
                }
                for (var i = 0; i < allTypes.length; i++) {
                    var outType = allTypes[i];
                    if (outType !== inputType) {
                        convertData[outType] = b.toString(outType);
                        if (outType === 'hex') {
                            convertData[outType] = convertData[outType].toUpperCase();
                        }
                    }
                }
                return convertData;
            }
            element.on('focus blur keyup change', function (evt) {
                try {
                    var convertMap = convertAll(evt.target['value'], evt.target['name']);
                    scope.$apply(function () {
                        scope['dataToConvert'] = convertMap;
                    });
                }
                catch (e) {
                }
            });
        }
    };
});
function EncodingController() {
}
function BitwiseController(cryptolib) {
    var _this = this;
    this.bitwiseOperators = [
        { name: 'XOR', func: cryptolib.util.xor },
        { name: 'AND', func: cryptolib.util.and },
        { name: 'OR', func: cryptolib.util.or },
        { name: 'NOT', func: cryptolib.util.not }
    ];
    this.bitwiseOperator = this.bitwiseOperators[0];
    this.dataList = [{ value: '' }, { value: '' }];
    this.setBitwiseOperator = function (aBitwiseOperator) {
        _this.bitwiseOperator = aBitwiseOperator;
    };
    this.addDataElt = function () {
        _this.dataList.push({ value: '' });
    };
    this.removeDataElt = function () {
        if (_this.dataList.length > 2) {
            _this.dataList.pop();
        }
    };
    this.executeBitwiseOperation = function () {
        _this.result = '';
        var result;
        if (_this.bitwiseOperator.name === 'NOT') {
            result = _this.bitwiseOperator.func.call(null, new Buffer(_this.dataList[0].value, 'hex'));
        }
        else {
            result = new Buffer(_this.dataList[0].value, 'hex');
            for (var idx = 1; idx < _this.dataList.length; idx++) {
                result = _this.bitwiseOperator.func.call(null, result, new Buffer(_this.dataList[idx].value, 'hex'));
            }
        }
        _this.result = result.toString('hex').toUpperCase();
    };
}
//# sourceMappingURL=utils.js.map