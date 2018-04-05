

class ClientRequestHandler {

    constructor(initData) {
        this.initData = initData;
    }


    launchLongTask(ipcRenderer) {
        // var internalID = this.internalID;
        var payload = this.initData;
        if (!payload.ID) {
            throw new Error("Request doesn't has an ID");
        }

        return new Promise(function (resolve, reject) {

            // var { ipcRenderer, remote } = require('electron');
            if (ipcRenderer) {

                payload.a_timeBeforeSendPrintPDFAsync = Date.now() - payload.startTime;
                ipcRenderer.send('print-pdf-async', payload);
                payload.b_timeAfterSendPrintPDFAsync = Date.now() - payload.startTime;

                // Listen for async-reply message from main process
                ipcRenderer.on('rest-test-async-reply-back' + payload.ID, (event, data) => {
                    // console.log("Async Reply back : ", ipcRenderer.listeners.length, data);
                    data.j_timeReceiveAsyncReply = Date.now() - data.startTime;
                    // Delete all listeners for socket "channel".
                    ipcRenderer.removeAllListeners('rest-test-async-reply-back' + payload.ID);
                    data.k_timeSpentRemovingListeners = Date.now() - data.startTime;
                    resolve(data);
                });

            }


        });
    }

    checkRequestConsistency() {
        var payload = this.initData;
        return new Promise(function (resolve, reject) {

            if (!payload.ip) {
                reject('Request doesn\'t have an IP.');
            }

            if (!payload.login) {
                reject('Please provide at least a login.');
            }

            if (!payload.password) {
                reject('Plese provide at least a password.');
            }

            resolve(payload);
        });
    }

    /**
     * There we only check if the current user IP is not already in the loop.
     */
    checkUserValidity(usersLoginIPCollection) {
        var payload = this.initData;
        return new Promise(function (resolve, reject) {
            for (var i = 0; i < usersLoginIPCollection.length; i++) {
                if (usersLoginIPCollection[i].ip && usersLoginIPCollection[i].ip == payload.ip) {
                    //found it....
                    reject("User already logged in, please consider login out before")
                }
            } 
            resolve(payload);
        });
    }


    /**
     * Remove the uset from the connected users list using the IP
     */
    disconnectUser(usersLoginIPCollection, privateConectedUsersList ) {
        var payload = this.initData;
        return new Promise(function (resolve, reject) {
            for (var i = 0; i < usersLoginIPCollection.length; i++) {
                if (usersLoginIPCollection[i].ip && usersLoginIPCollection[i].ip == payload.ip) {
                    usersLoginIPCollection.splice(i, 1)
                }

                if (privateConectedUsersList[i].ip && privateConectedUsersList[i].ip == payload.ip) {
                    privateConectedUsersList.splice(i, 1)
                }
            } 

            resolve("user removed !!")
        });
    }
}


//Export that Fuc*** module...
module.exports = ClientRequestHandler; 