declare namespace jsrsasign {
  
    interface KeyUtil {
      getKey(params:any):any;      
    }

    interface JsRsaSign {
      KEYUTIL: KeyUtil
    }

}

declare var jsrsasign: jsrsasign.JsRsaSign;

declare module 'jsrsasign' {

    export = jsrsasign;
}