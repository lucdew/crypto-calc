export namespace random {

   let webCrypto = typeof window !== "undefined" && (( < any > window).crypto || ( < any > window).msCrypto);

    export function generate(length: number): Buffer {
        if (webCrypto) {
            let res = new Uint8Array(length);
            webCrypto.getRandomValues(res);
            return new Buffer(res);
        } else {
            return require("crypto").randomBytes(length);
        }
    }

}
