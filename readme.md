# crypto-calc

> Cryptographic Calculator

Crypto-calc is a crypto "swiss army knife" like app that enables to perform some cryptographic operations on small amount of data.
It is developed as web application and should run fine on Chrome/Firefox/Safari (the Internet Explorer has some issues even on IE 11 ). Note that all cryptographic operations run locally (no Ajax).

**Project is no longer maintained.**


## Features

Currently the following features are implemented.

* Symmetric encryption/decryption:
  * Ciphers: **DES** / **3DES** / **AES** (! 3DES with double length or triple length keys!)
  * Block cipher modes: **ECB** / **CBC** / **CFB** / **OFB** / **CTR** / **GCM** with **Additional Authenticated Data**
  * Padding: **ISO-7816-4** / **PKCS#5(PKCS#7)** / **NO Padding** / **X.923** / **ISO 10126**


* RSA encryption/decryption:
 * Algos: **RSA-OAEP**/ **PKCS#1.5**
 * Keypair: **raw public key** , **x509 certificate** (only encryption), (encrypted) **pkcs#8**, **raw private key** 

* Banking:
  * **ISO-9564** format 0 to 3 PIN block generation and parsing
  * **Primary Account Number (PAN)** parsing detecting the issuing network


* Message hashing and HMAC:
  * **MD5**
  * **SHA1** 
  * **SHA2** (224,256,384,512,512-224,512-256)
  * **SHA3** (384,512)


* Utilities: 
  * Encoding/Decoding to/from base64,hexa string, ascii...<br/>
  * Bitwise operations



## Web Build
Install dependencies

```
$ npm install
```
and build

```
$ npm run-script buildweb
```
The zip file in the dist folder holds the web app.

## License
MIT © [lude](http://github.com/lucdew/crypto-calc)
