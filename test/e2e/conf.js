module.exports.config = { 
  chromeOnly: true,
  // chromeDriver: '/Users/janderson/Git/sena-offline/webkitbuilds/releases/sena-offline/mac/sena-offline.app/Contents/MacOS/chromedriver',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      // --allow-file-access-from-files - allow XHR from file://
      args: ['allow-file-access-from-files']
    }
  },
  onPrepare: function() {

        // By default, Protractor use data:text/html,<html></html> as resetUrl, but 
        // location.replace from the data: to the file: protocol is not allowed
        // (we'll get ‘not allowed local resource’ error), so we replace resetUrl with one
        // with the file: protocol (this particular one will open system's root folder)
    browser.resetUrl = 'file://';
  },
  directConnect: true,
  baseUrl: 'file://' + __dirname + '/../../build/app/',
  specs: ['./**/*-spec.js']
};
