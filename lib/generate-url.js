"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routerStateToUrl = exports.generateUrl = void 0;

var _pathToRegexp = require("path-to-regexp");

var _queryString = require("query-string");

/*
 * Credits to https://github.com/nareshbhatia/mobx-state-router
 */
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


var generateUrl = function generateUrl() {
  var pattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // inject params
  var generator = getGenerator(pattern);
  var url = generator(params); // inject queryParams (remember to insert the question mark)

  if (Object.keys(queryParams).length > 0) {
    url = "".concat(url, "?").concat((0, _queryString.stringify)(queryParams));
  }

  return url;
};
/**
 * Converts the supplied routerState to a URL
 * @param {RouterStore} routerStore
 * @param {RouterState} routerState
 * @returns {string}
 */


exports.generateUrl = generateUrl;

var routerStateToUrl = function routerStateToUrl(routerStore, routerState) {
  var routeName = routerState.routeName,
      params = routerState.params,
      queryParams = routerState.queryParams;
  var route = routerStore.getRoute(routeName);
  return generateUrl(route.path, params, queryParams);
};

exports.routerStateToUrl = routerStateToUrl;