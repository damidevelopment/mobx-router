"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncHistoryWithStore = void 0;

var _mobx = require("mobx");

var syncHistoryWithStore = function syncHistoryWithStore(history, store) {
  // Initialise store
  store.history = history; // Handle update from history object

  var handleLocationChange = function handleLocationChange(location) {
    store._updateLocation(location);
  };

  var unsubscribeFromHistory = history.listen(handleLocationChange);
  handleLocationChange(history.location);

  var subscribe = function subscribe(listener) {
    var onStoreChange = function onStoreChange() {
      var rawLocation = (0, _mobx.toJS)(store.location);
      listener(rawLocation, history.action);
    }; // Listen for changes to location state in store


    var unsubscribeFromStore = (0, _mobx.observe)(store, 'location', onStoreChange);
    onStoreChange();
    return unsubscribeFromStore;
  };

  history.subscribe = subscribe;
  history.unsubscribe = unsubscribeFromHistory;
  return history;
};

exports.syncHistoryWithStore = syncHistoryWithStore;