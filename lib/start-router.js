"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startRouter = void 0;

var _queryString = require("query-string");

var _history = require("history");

var _routerStore = require("./router-store");

var _sync = require("./sync");

var _utils = require("./utils");

var _mobx = require("mobx");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var startRouter = function startRouter(views, rootStore) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      resources = _ref.resources,
      _ref$runAllEvents = _ref.runAllEvents,
      runAllEvents = _ref$runAllEvents === void 0 ? false : _ref$runAllEvents,
      config = _objectWithoutProperties(_ref, ["resources", "runAllEvents"]);

  var store = new _routerStore.RouterStore();
  typeof rootStore === 'function' ? rootStore = rootStore(store) : rootStore.routerStore = store;
  var browserHistory = (0, _history.createBrowserHistory)();
  var history = (0, _sync.syncHistoryWithStore)(browserHistory, store);

  var _buildRoutesAndViewSl = (0, _utils.buildRoutesAndViewSlots)(views),
      routes = _buildRoutesAndViewSl.routes,
      currentView = _buildRoutesAndViewSl.currentView;

  store.configure(_objectSpread({}, config, {
    routes: routes,
    currentView: currentView
  }));

  var getPropValuesFromArray = function getPropValuesFromArray(objArr, prop) {
    return objArr.reduce(function (arr, obj) {
      arr.push(obj[prop]);
      return arr;
    }, []);
  };

  var buildAction = function buildAction(fn) {
    var runAction;

    if (typeof fn === 'string') {
      var path = fn.split('.');
      var obj = path[0];
      var action = path[1];

      if (resources.hasOwnProperty(obj) && typeof resources[obj][action] === 'function') {
        runAction = resources[obj][action];
      } else {
        runAction = function runAction() {
          console.error('Resource "', path.join('.'), '" does not exists!');
          return Promise.resolve();
        };
      }
    } else if (typeof fn === 'function') {
      runAction = fn;
    }

    return runAction;
  };

  var apply = function apply(task, params) {
    var runAction = buildAction(task);
    var result = typeof runAction === 'function' ? runAction(params, rootStore) : null;
    return (0, _utils.isPromise)(result) ? result : Promise.resolve(result);
  };

  history.subscribe(function (location, action) {
    var matchedRoutes = (0, _utils.getObjectKeys)(store.routes).reduce(function (arr, routeName) {
      var route = store.routes[routeName];
      var keys = route.path.match(location.pathname);

      if (keys) {
        var params = _objectSpread({}, (0, _utils.buildParamsObject)(keys, route.path.tokens, route.defaultParams), {}, (0, _queryString.parse)(location.search));

        arr.push({
          route: route,
          params: params
        });
      }

      return arr;
    }, []); // TODO: if more than one route is matched, what to do?
    // if (matchedRoutes.length > 1) {
    // }

    var match = matchedRoutes.shift(); // TODO: when 404 happens, should we redirect or replace?
    // default redirect

    if (!match) {
      console.error('404 Not Found!');
      store.goTo('notFound');
      return; // route = store.routes.notFound;
    }

    store.nextState = {
      routeName: match.route.pathname,
      params: (0, _mobx.toJS)(match.params)
    }; // build new path for matched route

    var newPath = [];

    if (match.route.fallbackState === null) {
      match.route.fallbackState = store.currentRoute ? {
        routeName: store.currentRoute.pathname,
        params: (0, _mobx.toJS)(store.params)
      } : match.route.defaultState;
    }

    if (match.route.fallbackState) {
      var _match$route$fallback = match.route.fallbackState,
          routeName = _match$route$fallback.routeName,
          params = _match$route$fallback.params;
      var route = store.routes[routeName];

      if (route) {
        newPath = newPath.concat((0, _utils.buildLookupPath)(route));
        match.params = _objectSpread({}, params, {}, match.params);
      }
    }

    newPath = newPath.concat((0, _utils.buildLookupPath)(match.route));
    newPath = _toConsumableArray(new Set(newPath)); // remove duplicates

    var currentRoute = (0, _utils.buildLookupPath)(store.currentRoute); // add routes from previous path for onExit event to be triggered

    var oldPath = currentRoute.reverse().filter(function (route) {
      return route.isActive && !newPath.includes(route);
    });

    if (!runAllEvents) {
      newPath = newPath.filter(function (route, i) {
        return route.isActive && currentRoute.includes(route) && route["final"] && i === newPath.length - 1 || !route.isActive || i === newPath.length - 1 && route === store.currentRoute;
      });
    } // build params


    var pathParams = newPath.reduce(function (obj, route) {
      return _objectSpread({}, route.defaultParams, {}, obj);
    }, match.params);

    if (newPath.length > 0 && oldPath.length > 0 && newPath[newPath.length - 1].slot !== oldPath[0].slot && oldPath[0].fallbackState !== false) {
      var _routeName = oldPath[0].fallbackState.routeName;
      var _route = store.routes[_routeName];
      var contextOldPath = (0, _utils.buildLookupPath)(_route).reverse().filter(function (route) {
        return route.isActive;
      });
      oldPath = oldPath.concat(contextOldPath);
    } // build fns


    var fns = _utils.buildFnsArray.apply(void 0, _toConsumableArray(getPropValuesFromArray(oldPath, 'onExit')));

    var _loop = function _loop(i) {
      var route = newPath[i];
      fns = fns.concat((0, _utils.buildFnsArray)(route.beforeEnter, runAllEvents && route.isActive && newPath.length - 1 !== i || function (params, rootStore) {
        return void store.onMatch(params, rootStore, route);
      }));
    };

    for (var i = 0; i < newPath.length; i++) {
      _loop(i);
    } // invoke fns
    // @see https://decembersoft.com/posts/promises-in-serial-with-array-reduce/


    fns.reduce(function (promiseChain, currentTask) {
      return promiseChain.then(function (chainResults) {
        return apply(currentTask, chainResults).then(function (currentResult) {
          return _objectSpread({}, chainResults, {}, currentResult);
        });
      });
    }, Promise.resolve(pathParams)).then((0, _mobx.action)(function () {
      // set current route and params
      store.currentRoute = match.route;
      store.params = pathParams; // set previous location

      store.previousLocation = location;
    }), // TODO: handle rejected promise
    function () {
      newPath.forEach(function (route) {
        return route.isActive = false;
      });
      return Promise.resolve();
    }) // finally
    .then(function () {
      oldPath.forEach(function (route) {
        if (route.fallbackState !== false && route.fallbackState.routeName === store.currentRoute.pathname) {
          route.fallbackState = null;
        }

        route.isActive = false;
      });
    });
  }); // history.subscribe end
};

exports.startRouter = startRouter;