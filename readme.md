# crypto-calc

> Cryptographic Calculator

Crypto-calc is a crypto "swiss army knife" like app that enables to perform some cryptographic operations on small amount of data
It is developed in javascript and offers 2 flavours: 
* A desktop app based on [atom/electron](https://github.com/atom/electron). It should run on Windows,Mac,Linux but has only been tested on Windows
* A web app. It should run fine on Chrome/Firefox/Safari (the Internet Explorer has some issues even on IE 11 ). Note that all cryptographic
operations run locally (no Ajax)

It is still in development and should not be used for production.
To see a live demo go to [cryptocalc.dewavrin.info](http://cryptocalc.dewavrin.info). Again do not use for production especially since
it is delivered on http and content can be easily altered with mitm.

So far it supports :
* Symmetric encryption/decryption with :
  * **DES** / **3DES** / **AES** ciphers (! 3DES with double length or triple length keys!)
  * **ECB** / **CBC** / **CFB** / **OFB** / **CTR** / **GCM** block cipher modes
  * **ISO-7816-4** / **PKCS#5(PKCS#7)** / **NO Padding** / **X9.23** / **ISO 10126** padding

  <img src="images/screenshots/symencrypt.png" alt="Symmetric encryption" width="400"/>
	
* Banking :
  * **ISO-9564** format 0 to 3 pin block generation and parsing
  * Primary Account Number (**PAN**) parsing
  
  <img src="images/screenshots/banking-pin.png" alt="Iso PIN" width="400"/>

* Utilities : Encoding/Decoding to/from base64,hexa string, ascii...<br/>
<img src="images/screenshots/utils-convert.png" alt="Encoding" width="400"/>



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
