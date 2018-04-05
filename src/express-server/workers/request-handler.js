class ClientRequestHandler {
  constructor(initData) {
    this.initData = initData;
  }

  checkRequestConsistency() {
    var payload = this.initData;
    return new Promise(function(resolve, reject) {
      if (!payload.ip) {
        reject("Request doesn't have an IP.");
      }

      if (!payload.login) {
        reject("Please provide at least a login.");
      }

      if (!payload.password) {
        reject("Plese provide at least a password.");
      }

      resolve(payload);
    });
  }

  /**
   * There we only check if the current user IP is not already in the loop.
   */
  checkUserValidity(usersLoginIPCollection) {
    var payload = this.initData;
    return new Promise(function(resolve, reject) {
      for (var i = 0; i < usersLoginIPCollection.length; i++) {
        if (
          usersLoginIPCollection[i].ip &&
          usersLoginIPCollection[i].ip == payload.ip
        ) {
          //found it....
          reject("User already logged in, please consider login out before");
        }
      }
      resolve(payload);
    });
  }

  verifyUserToken( privateConectedUsersList) {
    //First
    var payload = this.initData;
    return new Promise(function(resolve, reject) {
      //First verify the user Token
      for (var i = 0; i < privateConectedUsersList.length; i++) {
        if (
          privateConectedUsersList[i].ip &&
          privateConectedUsersList[i].ip == payload.ip &&
          privateConectedUsersList[i].token == payload.token
        ) {
          resolve("ok");
        }
      }

      reject("Invalid token !");
    });
  }

  /**
   * Remove the uset from the connected users list using the IP
   */
  disconnectUser(usersLoginIPCollection, privateConectedUsersList) {
    var payload = this.initData;
    return new Promise(function(resolve, reject) {
      for (var i = 0; i < usersLoginIPCollection.length; i++) {
        if (
          usersLoginIPCollection[i].ip &&
          usersLoginIPCollection[i].ip == payload.ip
        ) {
          usersLoginIPCollection.splice(i, 1);
        }

        //same length so...
        if (
          privateConectedUsersList[i].ip &&
          privateConectedUsersList[i].ip == payload.ip
        ) {
          privateConectedUsersList.splice(i, 1);
        }
      }

      resolve("user removed !!");
    });
  }
}

//Export that Fuc*** module...
module.exports = ClientRequestHandler;
