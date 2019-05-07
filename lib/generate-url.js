"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routerStateToUrl = exports.generateUrl = exports.getGenerator = void 0;

var _pathToRegexp = require("path-to-regexp");

var _queryString = require("query-string");

var _mobx = require("mobx");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

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

  if (!route) {
    return '#(no route found for ' + toState.routeName + ')';
  }

  var defaultParams = route.view.defaultParams;

  var params = _objectSpread({}, defaultParams, (0, _mobx.toJS)(routerStore.params), (0, _mobx.toJS)(toState.params));

  var queryParams = _objectSpread({}, toState.queryParams);

  return generateUrl(route.pattern, params, queryParams);
};

exports.routerStateToUrl = routerStateToUrl;