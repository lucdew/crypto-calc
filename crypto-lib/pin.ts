import {error} from "./error";
import {util} from "./util";
import {random} from "./random";

export namespace pin {

  export interface IIsoPinTypeStatic {
        format0: IIsoPinType;
        format1: IIsoPinType;
        format2: IIsoPinType;
        format3: IIsoPinType;
        getAll(): IIsoPinType[];
    }

    export interface IIsoPinType {
        name: string;
        value: number;
    }

    export interface IIsoPin {
        type: IIsoPinType;
        pin: string;
        additionalData: string;
        toBlock(): Buffer;
    }

    export const isoPinType: IIsoPinTypeStatic = {
        format0: {
            name: "ISO_9564_Format_0",
            value: 0
        },
        format1: {
            name: "ISO_9564_Format_1",
            value: 1
        },
        format2: {
            name: "ISO_9564_Format_2",
            value: 2
        },
        format3: {
            name: "ISO_9564_Format_3",
            value: 3
        },
        getAll: () => {
            return [isoPinType.format0, isoPinType.format1, isoPinType.format2, isoPinType.format3];
        }
    };

    function generateIsoPinRandomPadding(length: number) {

        let result = "";
        let buffer = random.generate(length);
        for (let i = 0; i < length; i++) {
            result += ((buffer[i] % 6) + 10).toString(16);
        }
        return result;
    }

    class IsoPin implements IIsoPin {
        public type: IIsoPinType;
        public pin: string;
        public additionalData: string;

        public static parseIsoPinBlock(block: Buffer, pan?: string): IIsoPin {
            if (block.length !== 8) {
                error.raiseInvalidArg("Invalid pin block size, must be 8 bytes");
            }
            let blockHex = block.toString("hex");
            let type: IIsoPinType = null;
            let allPinTypes = isoPinType.getAll();
            for (let idx = 0; idx < allPinTypes.length; idx++) {
                if (allPinTypes[idx].value.toString() === blockHex.substring(0, 1)) {
                    type = allPinTypes[idx];
                    break;
                }
            }
            if (!type) {
                error.raiseInvalidArg("Unsupported type " + blockHex.substring(0, 1));
            }
            let pinLength = 0;
            try {
                pinLength = parseInt(blockHex.substring(1, 2), 16);
            } catch (e) {
                error.raiseInvalidArg("Invalid pin length");
            }

            if (type.value === 0 || type.value === 3) {
                if (!pan) {
                    let e: any = new error.CryptoError(error.PAN_MISSING, "Pan is missing");
                    e.additionalInfo = {
                        pinLength: pinLength,
                        pinType: type
                    };
                    throw e;
                }
                let paddedPan = "0000" + pan;
                let xoredPin = util.xor(block,
                    new Buffer(paddedPan, "hex"));
                return new IsoPin(type, xoredPin.toString("hex").substring(2, 2 + pinLength), pan);

            } else {
                return new IsoPin(type, block.toString("hex").substring(2, 2 + pinLength));
            }

        }

        constructor(aType: IIsoPinType, aPin: string, someAdditionalData?: string) {
            if (aPin.length < 1 || aPin.length > 14) {
                error.raiseInvalidArg("Unsupported pin length of " + aPin.length);
            }

            let paddingLength = 14 - aPin.length;
            if (aType === isoPinType.format0 || aType === isoPinType.format3) {
                if (!someAdditionalData || someAdditionalData.length !== 12) {
                    error.raiseInvalidArg("Pan is missing or not of 12 chars length,  it shall be provided for type " + aType);
                }
            } else if (aType === isoPinType.format1) {
                if (!someAdditionalData) { // pad with random number
                    someAdditionalData = util.generateRandomNumberString(paddingLength);
                }
                if (someAdditionalData.length < paddingLength) {
                    error.raiseInvalidArg("Not enough additional data (pan or transaction id) for pin type" + aType);
                }
                if (someAdditionalData.length > paddingLength) {
                    someAdditionalData = someAdditionalData.substring(0, paddingLength);
                }

            } else {
                if (someAdditionalData) {
                    error.raiseInvalidArg("Unexpected additional data for pin type" + aType);
                }

            }
            this.type = aType;
            this.pin = aPin;
            this.additionalData = someAdditionalData;

        }


        public toBlock(): Buffer {

            let tl = this.type.value.toString() + this.pin.length.toString(16);

            if (this.type.value === 1) {
                return new Buffer(tl + this.pin + this.additionalData, "hex");
            } else if (this.type.value === 2) {
                let paddedPin = tl + this.pin;
                paddedPin = util.rightPad(paddedPin, 16, "F");
                return new Buffer(paddedPin, "hex");
            } else if (this.type.value === 0 || this.type.value === 3) {
                let paddedPin = tl + this.pin;
                let paddingLength = 14 - this.pin.length;
                if (this.type.value === 3) {
                    paddedPin += generateIsoPinRandomPadding(paddingLength);
                } else {
                    paddedPin = util.rightPad(paddedPin, 16, "F");
                }

                let paddedPan = "0000" + this.additionalData;
                return util.xor(new Buffer(paddedPin, "hex"),
                    new Buffer(paddedPan, "hex"));
            }

            error.raiseInvalidArg("unsupport pin type with value " + this.type.value);

        }

    }

    export function createIsoPin(aIsoPinType: IIsoPinType, pin: string, additionalData?: string): IIsoPin {
        return new IsoPin(aIsoPinType, pin, additionalData);
    };

    export function createIsoPinFromBlock(block: Buffer, pan?: string): IIsoPin {
        return IsoPin.parseIsoPinBlock(block, pan);
    };

}
