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

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var startRouter = function startRouter(views, rootStore) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      resources = _ref.resources,
      config = _objectWithoutProperties(_ref, ["resources"]);

  var browserHistory = (0, _history.createBrowserHistory)();
  var store = rootStore.routerStore = new _routerStore.RouterStore();
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
      console.log('buildAction', resources);

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

  var compileSyncAction = function compileSyncAction(callback) {
    return function () {
      var runAction = buildAction(callback);
      return runAction.apply(void 0, arguments);
    };
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
        var params = _objectSpread({}, (0, _utils.buildParamsObject)(keys, route.path.tokens), (0, _queryString.parse)(location.search));

        arr.push({
          route: route,
          params: params
        });
      }

      return arr;
    }, []); // matchedRoutes
    //     .filter(match => match.route.final)
    //     .forEach(match => console.log('whoooo', match));

    if (matchedRoutes.length > 1) {// TODO: if more than one route is matched, what to do?
    }

    var match = matchedRoutes.shift(); // TODO: when 404 happens, should we redirect or replace?
    // default redirect

    if (!match) {
      console.log('404 Not Found!'); // store.replace('notFound');

      return; // route = store.routes.notFound;
    } // add only routes that are not currently active


    var newPath = (0, _utils.buildLookupPath)(match.route); // call onExit
    // add routes from previous path for onExit calls

    var oldPath = (0, _utils.buildLookupPath)(store.currentRoute, {
      reverse: false
    }).filter(function (route) {
      return route.isActive && !newPath.includes(route);
    }); // TODO there should be check if route params changed

    newPath = newPath.filter(function (route, i) {
      return !route.isActive || i === newPath.length - 1
      /* && route !== store.currentRoute*/
      ;
    });
    console.log('lookup', newPath, oldPath); // build fns

    var fns = _utils.buildFnsArray.apply(void 0, _toConsumableArray(getPropValuesFromArray(oldPath, 'onExit')))
    /*.map(fn => compileSyncAction(fn))*/
    ;

    var _loop = function _loop(i) {
      var route = newPath[i];
      fns = fns.concat((0, _utils.buildFnsArray)(route.beforeEnter, function (params, rootStore) {
        store.onMatch(params, rootStore, route);
      }));
    };

    for (var i = 0; i < newPath.length; i++) {
      _loop(i);
    }

    console.log('callback fns', fns); // invoke fns
    // @see https://decembersoft.com/posts/promises-in-serial-with-array-reduce/

    fns.reduce(function (promiseChain, currentTask) {
      return promiseChain.then(function (chainResults) {
        return apply(currentTask, chainResults).then(function (currentResult) {
          return _objectSpread({}, chainResults, currentResult);
        });
      });
    }, Promise.resolve(match.params)).then( // set currentRoute on success
    function () {
      store.params = match.params;
      store.currentRoute = match.route;
    }, // TODO: handle rejected promise
    function () {
      var _console;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_console = console).error.apply(_console, ['Route error:'].concat(args));
    }) // finalize
    .then(function () {
      for (var i in oldPath) {
        oldPath[i].isActive = false;
      }
    });
  }); // history.subscribe end
};

exports.startRouter = startRouter;