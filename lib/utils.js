"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewsForDirector = exports.buildParamsObject = exports.getPath = exports.getQuery = exports.compileAsyncAction = exports.compileSyncAction = exports.buildFnsArray = exports.noopAsync = exports.getObjectKeys = void 0;

var _mobxUtils = require("mobx-utils");

var _pathToRegexp = _interopRequireWildcard(require("path-to-regexp"));

var _queryString = require("query-string");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

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
  if (typeof callback === 'string' && callback !== '') {
    return callback;
  }

  if (typeof callback !== 'function') {
    return noopAsync;
  }

  return function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var next = args.pop();
    var routerStore = rootStore.routerStore;
    callback(routerStore.getRouteParams(), rootStore);
    next();
  };
};

exports.compileSyncAction = compileSyncAction;

var compileAsyncAction = function compileAsyncAction(rootStore, callback) {
  if (typeof callback === 'string' && callback !== '') {
    return callback;
  }

  if (typeof callback !== 'function') {
    return noopAsync;
  }

  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var next = args.pop();
    var routerStore = rootStore.routerStore;
    var result = callback(routerStore.getRouteParams(), rootStore); // @see mobx-utils fromPromise

    if ((0, _mobxUtils.isPromiseBasedObservable)(result)) {
      result["case"](function () {}, function (err) {
        return next(false);
      }, function () {
        return next();
      });
    } else if (isPromise(result)) {
      result.then(function () {
        return next();
      }, function (err) {
        return next(false);
      });
    } else {
      next();
    }
  };
};

exports.compileAsyncAction = compileAsyncAction;

var getQuery = function getQuery() {
  var query = window.location.search;
  return (0, _queryString.parse)(query);
};

exports.getQuery = getQuery;

var getPath = function getPath() {
  var path = window.location.pathname;

  if (path.substr(0, 1) !== '/') {
    path = (_readOnlyError("path"), '/' + path);
  }

  return path;
};

exports.getPath = getPath;

var buildParamsObject = function buildParamsObject(pattern) {
  var defaultParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var path = getPath();
  var params = (0, _pathToRegexp["default"])(pattern).exec(path);

  if (!params) {
    return null;
  }

  params.shift();
  var tokens = (0, _pathToRegexp.parse)(pattern); // in best case scenario tokens.length === params.length and token indexes match params indexes
  // Known issues:
  // There are 2 scenarios which are not included in this solution and should be fixed.
  // - repeat pattern, single token for multiple parsed params
  //   `/:foo(\d)+` => `/123/456` => ['123', '456']
  //   should resolve { foo: ['123', '456'] }, but resolves { foo: '123' }
  // - optionals inside pattern
  //   `/:lang(cs|en)?/:bar` => /bar => ['bar']
  //   should resolve { lang: null, bar: 'bar' }, but resolves { lang: 'bar', bar: null }

  return tokens.filter(function (token) {
    return _typeof(token) === 'object';
  }).reduce(function (obj, token, index) {
    // TODO resolve optionals in the middle of pattern
    obj[token.name] = params[index] || defaultParams[token.name] || null;
    return obj;
  }, {});
};

exports.buildParamsObject = buildParamsObject;

var viewsForDirector = function viewsForDirector(views, rootStore) {
  return getObjectKeys(views).reduce(function (obj, viewKey) {
    var view = views[viewKey];
    var routerStore = rootStore.routerStore;
    obj[view.pattern] = _objectSpread({}, viewsForDirector(view.subroutes, rootStore), {
      on: buildFnsArray(view.beforeEnter).map(function (fn) {
        return compileAsyncAction(rootStore, fn);
      }).concat(function () {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var next = args.pop();
        routerStore.onMatch(rootStore, view);
        next();
      })
    });
    return obj;
  }, {});
};

exports.viewsForDirector = viewsForDirector;