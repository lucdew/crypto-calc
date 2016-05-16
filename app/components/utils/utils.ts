import {util} from "../../../crypto-lib/";
import {ISendToMenuService} from "../../services";

let utilsModule = angular.module("CryptoCalcModule.utils", [])
    .controller("UtilsBitwiseController", ["SendToMenuService", BitwiseController])
    .controller("UtilsEncodingController", [EncodingController]);

function EncodingController() {
    // ignore empty
}

function BitwiseController(sendToMenuService: ISendToMenuService) {

    this.bitwiseOperators = [{
        name: "XOR",
        func: util.xor
    }, {
        name: "AND",
        func: util.and
    }, {
        name: "OR",
        func: util.or
    }, {
        name: "NOT",
        func: util.not
    }];
    this.bitwiseOperator = this.bitwiseOperators[0];

    this.dataList = [{
        value: new Buffer("")
    }, {
        value: new Buffer("")
    }];

    sendToMenuService.updateContext("bitwise", this);

    this.setBitwiseOperator = (aBitwiseOperator: any) => {
        this.bitwiseOperator = aBitwiseOperator;
    };

    this.addDataElt = () => {
        this.dataList.push({
            value: new Buffer("")
        });
    };

    this.removeDataElt = () => {
        if (this.dataList.length > 2) {
            this.dataList.pop();
        }
    };

    this.executeBitwiseOperation = () => {
        let result: Buffer;

        try {
            if (this.bitwiseOperator.name === "NOT") {
                result = this.bitwiseOperator.func.call(null, this.dataList[0]);
            } else {
                result = this.dataList[0].value;
                for (let idx = 1; idx < this.dataList.length; idx++) {
                    // console.log(this.dataList[idx].value.toString("hex"));
                    result = this.bitwiseOperator.func.call(null, result, this.dataList[idx].value);
                }

            }
            this.result = result;
        } catch (err) {
            console.log(err);
        }
    };

}

export default utilsModule.name;

// BitwiseController.prototype.activate = function (scope) {
//     // Renamed controller"s name in the view since it holds a dot and is not well interpreted
//     scope.bitwise = scope["utils.bitwise"];
// }
// BitwiseController.prototype.activate.$inject = ["$scope"];
