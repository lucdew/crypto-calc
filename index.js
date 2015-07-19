'use strict';
const app = require('app');
const path = require('path');
const BrowserWindow = require('browser-window');
const ipc = require('ipc');

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

//const cryptoLib = require('./js/cryptolib');

function createMainWindow () {
	var win = new BrowserWindow({
		width: 800,
		height: 800,
		resizable: true,
	        icon: path.join(__dirname, 'images', 'lock_2x.png')
	});

	win.loadUrl(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	


	return win;
}

function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}

// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

ipc.on('application:open-url', function(opts) {
     console.log(opts);
  
});


app.on('ready', function () {
	var protocol = require('protocol');
    protocol.registerProtocol('atom', function(request) {
      var url = request.url.substr(7)
      return new protocol.RequestFileJob(path.normalize(__dirname + '/' + url));
    });
	mainWindow = createMainWindow();
});
