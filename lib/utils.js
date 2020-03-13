"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildFnsArray = exports.buildLookupPath = exports.buildParamsObject = exports.buildRoutesAndViewSlots = exports.getObjectKeys = exports.isObject = exports.isPromise = void 0;

var _pathToRegexp = _interopRequireDefault(require("path-to-regexp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isPromise = function isPromise(obj) {
  return isObject(obj) && typeof obj.then === 'function';
};

exports.isPromise = isPromise;

var isObject = function isObject(obj) {
  return obj != null && _typeof(obj) === 'object' && !Array.isArray(obj);
};

exports.isObject = isObject;

var getObjectKeys = function getObjectKeys(obj) {
  return isObject(obj) ? Object.keys(obj) : [];
};

exports.getObjectKeys = getObjectKeys;

var buildRoutesAndViewSlots = function buildRoutesAndViewSlots(views) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      parentKey = _ref.parentKey,
      parent = _ref.parent;

  return getObjectKeys(views).reduce(function (obj, viewKey) {
    var view = views[viewKey];
    var key = [parentKey, viewKey].filter(Boolean).join('.');
    view.name = viewKey;
    view.parent = parent || null; // TODO: why use final?

    if (view["final"]) {
      var pattern = [parent ? parent.pattern : null, view.pattern].filter(Boolean).join('').replace(/(\/\/+|\/\?)/g, '/');
      var tokens = [];
      var regexp = (0, _pathToRegexp["default"])(pattern, tokens);
      view.path = {
        pattern: pattern,
        match: regexp.exec.bind(regexp),
        tokens: tokens
      };
      view.defaultParams = _objectSpread({}, view.defaultParams, {}, parent ? parent.defaultParams : {});
      obj.routes[key] = view;
    }

    obj.currentView = (Array.isArray(view.slot) ? view.slot : [view.slot]).reduce(function (res, slot) {
      res[slot] = null;
      return res;
    }, obj.currentView);
    var result = buildRoutesAndViewSlots(view.subroutes, {
      parentKey: viewKey,
      parent: view
    });
    var subroutes = result.routes;
    obj.currentView = _objectSpread({}, obj.currentView, {}, result.currentView);
    return getObjectKeys(subroutes).reduce(function (obj, key) {
      obj.routes[key] = subroutes[key];
      return obj;
    }, obj);
  }, {
    routes: {},
    currentView: {}
  });
};

exports.buildRoutesAndViewSlots = buildRoutesAndViewSlots;

var buildParamsObject = function buildParamsObject(params, tokens) {
  var defaultParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (params.input) {
    params.shift();
  } // in best case scenario tokens.length === params.length and token indexes match params indexes
  // Known issues:
  // There are 2 scenarios which are not included in this solution and should be fixed.
  // - repeat pattern, single token for multiple parsed params
  //   `/:foo(\d)+` => `/123/456` => ['123', '456']
  //   should resolve { foo: ['123', '456'] }, but resolves { foo: '123' }
  // - optionals inside pattern
  //   `/:lang(cs|en)?/:bar` => /bar => ['bar']
  //   should resolve { lang: null, bar: 'bar' }, but resolves { lang: 'bar', bar: null }


  return tokens.filter(function (token) {
    return token && _typeof(token) === 'object';
  }).reduce(function (obj, token, index) {
    // TODO resolve optionals in the middle of pattern
    obj[token.name] = params[index] || defaultParams[token.name] || null;
    return obj;
  }, {});
};

exports.buildParamsObject = buildParamsObject;

var buildLookupPathInner = function buildLookupPathInner(route) {
  var path = [];

  if (route) {
    path = path.concat([route], buildLookupPathInner(route.parent));
  }

  return path;
};

var buildLookupPath = function buildLookupPath(route) {
  var path = buildLookupPathInner(route);
  path = path.length === 0 ? [route] : path;
  return path.reverse().filter(function (route) {
    return route;
  });
};

exports.buildLookupPath = buildLookupPath;

var buildFnsArray = function buildFnsArray() {
  var arr = [];

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return arr.concat.apply(arr, args).filter(function (fn) {
    return typeof fn === 'function' || typeof fn === 'string';
  });
};

exports.buildFnsArray = buildFnsArray;