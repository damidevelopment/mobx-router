"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewsForDirector = exports.compileAsyncAction = exports.compileSyncAction = exports.buildFnsArray = exports.noopAsync = exports.getObjectKeys = void 0;

var _mobxUtils = require("mobx-utils");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
};

var isObject = function isObject(obj) {
  return obj && _typeof(obj) === 'object' && !Array.isArray(obj);
};

var getObjectKeys = function getObjectKeys(obj) {
  return isObject(obj) ? Object.keys(obj) : [];
};

exports.getObjectKeys = getObjectKeys;

var noopAsync = function noopAsync() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var next = args.pop();
  next();
};

exports.noopAsync = noopAsync;

var buildFnsArray = function buildFnsArray() {
  var arr = [];

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return arr.concat.apply(arr, args).filter(function (fn) {
    return typeof fn === 'function' || typeof fn === 'string';
  });
};

exports.buildFnsArray = buildFnsArray;

var compileSyncAction = function compileSyncAction(rootStore, callback) {
  if (typeof callback === 'string') {
    return callback;
  }

  return function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var next = args.pop();
    callback(args, rootStore);
    next();
  };
};

exports.compileSyncAction = compileSyncAction;

var compileAsyncAction = function compileAsyncAction(rootStore, callback) {
  if (typeof callback === 'string') {
    return callback;
  }

  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var next = args.pop();
    var result = callback(args, rootStore); // @see mobx-utils fromPromise

    if ((0, _mobxUtils.isPromiseBasedObservable)(result)) {
      result["case"](function () {}, function (err) {
        return next(err);
      }, function () {
        return next();
      });
    } else if (isPromise(result)) {
      result.then(function () {
        return next();
      }, function (err) {
        return next(err);
      });
    } else {
      next();
    }
  };
};

exports.compileAsyncAction = compileAsyncAction;

var setCurrentRoute = function setCurrentRoute(routerStore, view) {
  return function () {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    var next = args.pop();
    routerStore.currentRoute = view;
    next();
  };
};

var viewsForDirector = function viewsForDirector(views, rootStore, foo) {
  var obj = getObjectKeys(views).reduce(function (obj, viewKey) {
    var view = views[viewKey];
    var routerStore = rootStore.routerStore;
    obj[view.path] = _objectSpread({}, viewsForDirector(view.subroutes, rootStore, true), {
      on: buildFnsArray(view.beforeEnter).map(function (fn) {
        return compileAsyncAction(rootStore, fn);
      }).concat(setCurrentRoute(routerStore, view), compileSyncAction(rootStore, routerStore.onMatch))
    });
    return obj;
  }, {});
  foo || console.log('viewsForDirector', obj);
  return obj;
};

exports.viewsForDirector = viewsForDirector;