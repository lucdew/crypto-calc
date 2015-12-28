# crypto-calc

> Cryptographic Calculator

Crypto-calc is a crypto "swiss army knife" like app that enables to perform some cryptographic operations on small amount of data
It is developed as web application and should run fine on Chrome/Firefox/Safari (the Internet Explorer has some issues even on IE 11 ). Note that all cryptographic
operations run locally (no Ajax)

There's also an experimental desktop app based on [atom/electron](https://github.com/atom/electron) for Windows/Mac OS X
As of Dec 2015, it is no longer maintained. 

Project is still in development and should not be used for production.
To see a live demo go to [cryptocalc.dewavrin.info](https://cryptocalc.dewavrin.info).F

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
  * **ISO-9564** format 0 to 3 pin block generation and parsing
  * **Primary Account Number (PAN)** parsing detecting the issuing network


* Message hashing and HMAC:
  * **MD5**
  * **SHA1** 
  * **SHA2** (224,256,384,512,512-224,512-256)
  * **SHA3** (384,512)


* Utilities: 
  * Encoding/Decoding to/from base64,hexa string, ascii...<br/>
  * Bitwise operations



## Windows Build

* Download and [Microsoft Visual Studio Express 13](https://www.visualstudio.com/en-us/products/visual-studio-express-vs.aspx)
* Download and install [nodejs](https://nodejs.org/download/)

From the command line,

Install dependencies

```
$ npm install
```
and build

```
$ npm run-script buildelectron
```
### Run

```
$ npm start
```
or execute the binary in the dist folder


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
