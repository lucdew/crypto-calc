import {util} from "./util";
import * as forge from "node-forge";

export namespace forgeutil {

    export function bufferToString(buffer: Buffer) {
        let res = "";

        for (let idx = 0; idx < buffer.length; idx++) {
            res += String.fromCharCode(buffer[idx]);
        }

        return res;
    }

    export function toForgeBuffer(buffer: Buffer) {
        return forge.util.createBuffer(util.toArrayBuffer(buffer));
        // return new forge.util.DataBuffer(toArrayBuffer(buffer));
    }
}
