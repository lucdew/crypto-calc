# crypto-calc

> Cryptographic Calculator

Crypto-calc is a "swiss army knife" like GUI that enables to perform some cryptographic operations on small amount of data

It is based on electron and should run on Windows,Mac,Linux (only tested on Windows)

It is still in development and should not be used for production.

So far it supports :
* Symmetric encryption/decryption (AES,DES,3DES) with different padding PKCS5/7 and ISO-7816-4
<img src="images/screenshots/symencrypt.png" alt="Symmetric encryption" width="400"/>
	
* Banking :
  * ISO9564 Pin block generation and parsing
  * Primary Account Number parsing
  
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
$ npm run build
```
### Run

```
$ npm start
```
or execute the binary in the dist folder

## License

MIT © [lude](http://github.com/lucdew/crypto-calc)
