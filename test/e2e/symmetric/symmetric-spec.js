'use strict';

const crypto = require('crypto');
describe('angularjs homepage encrypt', () => {

  // const EC = protractor.ExpectedConditions;

  beforeAll(() => {
      browser.get('/index.html');
      // browser.driver.wait(protractor.until.elementIsVisible(element(by.css('h1'))));
      // browser.waitForAngular();
  });

  const util = {
    setData: (data) => element(by.css('textarea[name="data"]')).sendKeys(data),
    setKey: (key) => element(by.css('input[name="key"]')).sendKeys(key),
    encrypt: () => element(by.css('button[name="encrypt"]')).click(),
    decrypt: () => element(by.css('button[name="decrypt"]')).click(),
    getResult: () => element(by.css('textarea[name="result"]')).getAttribute('value'),
    getDataboxSize: (name) => element(by.css(`#databox2-${name} > div.dataSize`)).getAttribute('value'),
    getKeyKcv: () => element(by.css('#symKey-key div.symKeyKcv')).getText(),
    expectEqualIgnoreCase: (p, expected) => p.then((text) => {
          expect(text.toLowerCase()).toEqual(expected.toLowerCase()); }),
    switchDataType: (typePos)=> {
      element.all(by.repeater('atype in types.split(\',\')')).get(typePos).click();
    }
  };


  it('should encrypt valid hex data with aes/ecb/nopadding', () => {

    let key = '11223344556677881122334455667788';

    util.setData('01020304050607080102030405060708');
    util.setKey(key);
    let cipher = crypto.createCipheriv('aes128',
            new Buffer('11223344556677881122334455667788', 'hex'),
            new Buffer('00000000000000000000000000000000', 'hex'));
    let res = cipher.update(new Buffer('00000000000000000000000000000000', 'hex'));

    expect(util.getKeyKcv()).toEqual('KCV: ' + res.toString('hex').toUpperCase().substring(0, 6));
    util.encrypt();

    util.expectEqualIgnoreCase(util.getResult(), 'A28D633F9686BD28865AFA76E1B186C0');

    // EC.textToBePresentInElement($(''))
  });


  it('should encrypt valid base64 data with aes/cbc/nopadding', () => {

    util.switchDataType(1);
    browser.sleep(5000);
    // TODO
  });


});

// TODO : test base64, utf-8, AES GCM, etc, sendToMenu
