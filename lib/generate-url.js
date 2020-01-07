"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routerStateToUrl = exports.generateUrl = exports.getGenerator = void 0;

var _pathToRegexp = require("path-to-regexp");

var _queryString = require("query-string");

var _mobx = require("mobx");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var generatorCache = {};

var getGenerator = function getGenerator(pattern) {
  var generator = generatorCache[pattern];

  if (generator) {
    return generator;
  }

  var compiledGenerator = (0, _pathToRegexp.compile)(pattern);
  generatorCache[pattern] = compiledGenerator;
  return compiledGenerator;
};
/**
 * Generates a URL from a pattern and parameters.
 * For example,
 *     generateUrl('/departments/:id', { id: 'electronics' })
 *     => '/departments/electronics'
 */


exports.getGenerator = getGenerator;

var generateUrl = function generateUrl() {
  var pattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // remove special chars, from patterns like '/$'
  pattern = pattern.replace(/|\$/, ''); // replace repeating slashes

  pattern = pattern.replace(/\/\/+/, '/'); // inject params

  var generator = getGenerator(pattern);
  var url = generator(params); // inject queryParams (remember to insert the question mark)

  if (Object.keys(queryParams).length > 0) {
    url = "".concat(url, "?").concat((0, _queryString.stringify)(queryParams));
  }

  return url;
};
/**
 * Converts the supplied state to a URL
 * @param {RouterStore} routerStore
 * @param {RouterState} toState
 * @returns {string}
 */


exports.generateUrl = generateUrl;

var routerStateToUrl = function routerStateToUrl(routerStore, toState) {
  var route = routerStore.getRoute(toState.routeName);
  toState.params = toState.params || {};
  toState.queryParams = toState.queryParams || {};

  if (!route) {
    return '/#(no route found for ' + toState.routeName + ')';
  }

  try {
    var defaultParams = route.defaultParams;
    var pathParams = {};
    var queryParams = {};
    Object.keys(toState.params).forEach(function (key) {
      if (!toState.params.hasOwnProperty(key)) {
        return;
      }

      if (route.path.tokens.findIndex(function (token) {
        return token.name === key;
      }) > -1) {
        pathParams[key] = toState.params[key];
      } else {
        queryParams[key] = toState.params[key];
      }
    });

    var params = _objectSpread({}, defaultParams, {}, (0, _mobx.toJS)(routerStore.params), {}, pathParams);

    return generateUrl(route.path.pattern, params, _objectSpread({}, queryParams, {}, toState.queryParams));
  } catch (e) {
    console.error('Missing parameter for route ', '\'' + toState.routeName + '\'', "\n", 'Original Error: ', e.message);
    return '/#(missing param for route ' + toState.routeName + ')';
  }
};

exports.routerStateToUrl = routerStateToUrl;