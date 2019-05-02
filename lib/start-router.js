"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startRouter = void 0;

var _director = require("director/build/director");

var _utils = require("./utils");

var _routerStore = require("./router-store");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var routeBeforeExit = function routeBeforeExit(rootStore, director) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _utils.noopAsync.apply(undefined, args);

    return;
    var routerStore = rootStore.routerStore;
    var view = routerStore.currentRoute;

    if (view.beforeExit == null) {
      // @intentionaly ==
      _utils.noopAsync.apply(undefined, args);
    } else {
      var next = args.pop();
      var fns = (0, _utils.buildFnsArray)(view.beforeExit).map(function (fn) {
        return (0, _utils.compileAsyncAction)(rootStore, fn);
      });
      director.invoke(fns, director, next);
    }
  };
};
/**
 * Initialize and cofigure director router
 *
 * @param  {object}               views             List of routes and subroutes
 * @param  {object|RootStore}     rootStore         App rootStore object
 * @param  {function|function[]}  options.onEnter   Action or list of Actions
 * @param  {function|function[]}  options.onExit    Action or list of Actions
 * @param  {function}             options.notFound  Not found Action
 * @return {void}
 */


var createDirectorRouter = function createDirectorRouter(views, rootStore) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      onEnter = _ref.onEnter,
      onExit = _ref.onExit,
      notFound = _ref.notFound,
      resource = _ref.resource;

  var director = new _director.Router(_objectSpread({}, (0, _utils.viewsForDirector)(views, rootStore)));
  var routerStore = rootStore.routerStore; // handler for changing routes

  routerStore.handler = function (route) {
    return director.setRoute(route);
  };

  director.configure({
    recurse: 'forward',
    async: true,
    html5history: true,
    before: (0, _utils.buildFnsArray)(onEnter).map(function (fn) {
      return (0, _utils.compileSyncAction)(rootStore, fn);
    }),
    after: (0, _utils.buildFnsArray)(routeBeforeExit(rootStore, director)).concat((0, _utils.buildFnsArray)(onExit).map(function (fn) {
      return (0, _utils.compileSyncAction)(rootStore, fn);
    })),
    notfound: (0, _utils.compileSyncAction)(rootStore, notFound),
    resource: (0, _utils.getObjectKeys)(resource).reduce(function (obj, name) {
      var fn = resource[name];
      obj[name] = (0, _utils.compileAsyncAction)(rootStore, fn);
      return obj;
    }, {})
  });
  director.init();
};

var buildRoutes = function buildRoutes(views) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      parentKey = _ref2.parentKey,
      parent = _ref2.parent;

  return (0, _utils.getObjectKeys)(views).reduce(function (obj, viewKey) {
    var view = views[viewKey];
    var key = [parentKey, viewKey].filter(function (foo) {
      return !!foo;
    }).join('.');
    obj[key] = {
      slot: view.slot,
      path: [parent ? parent.path : null, view.path].filter(function (foo) {
        return !!foo;
      }).join('')
    };
    var subroutes = buildRoutes(view.subroutes, {
      parentKey: viewKey,
      parent: view
    });
    return (0, _utils.getObjectKeys)(subroutes).reduce(function (obj, key) {
      obj[key] = subroutes[key];
      return obj;
    }, obj);
  }, {});
};

var startRouter = function startRouter(views, rootStore, config) {
  rootStore.routerStore = new _routerStore.RouterStore({
    routes: buildRoutes(views)
  }); //create director configuration

  createDirectorRouter(views, rootStore, config);
};

exports.startRouter = startRouter;