



var electron = require('electron');
var { app, BrowserWindow, ipcMain } = electron;

var path = require('path');
var fs = require('fs');




var serverWindow;

electron
  .app
  .on('window-all-closed', function () {
    if (process.platform != 'darwin') {
      electron.app.quit();
    }
  });

electron
  .app
  .on('ready', function () {

    serverWindow = new electron.BrowserWindow({
      width: 500, height: 800,
      frame: true, show: true
    })
    serverWindow.loadURL('file://' + __dirname + '/express-server/server-page.html');


    serverWindow.on('closed', function () {
      serverWindow = null;
    });
  });



