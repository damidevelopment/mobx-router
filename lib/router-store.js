"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouterState = exports.Route = exports.RouterStore = void 0;

var _mobx = require("mobx");

var _generateUrl = require("./generate-url");

var _class, _descriptor, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

/**
 * Class for RouterStore
 */
var RouterStore = (_class = (_temp =
/*#__PURE__*/
function () {
  /**
   * RouterStore constructor
   */
  function RouterStore() {
    _classCallCheck(this, RouterStore);

    _initializerDefineProperty(this, "location", _descriptor, this);

    this.currentView = null;
    this.history = null;
    this.routes = null;
    this.currentRoute = null;
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.go = this.go.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
  }

  _createClass(RouterStore, [{
    key: "configure",
    value: function configure(_ref) {
      var routes = _ref.routes,
          currentView = _ref.currentView;

      if (this.routes !== null) {
        return;
      }

      this.routes = routes;
      this.currentView = (0, _mobx.observable)(currentView);
    }
  }, {
    key: "_updateLocation",
    value: function _updateLocation(newState) {
      this.location = newState;
    }
  }, {
    key: "onMatch",
    value: function onMatch(params, rootStore, route) {
      route.isActive = true;
      console.log('onMatch', location); // change currentView only when slot exists and component is not empty

      if (this.currentView.hasOwnProperty(route.slot) && route.component != null) {
        // @intentionaly !=
        console.log('onMatch.real', route.slot);

        this.currentView[route.slot] = function () {
          return typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
        };
      }
    }
  }, {
    key: "goTo",
    value: function goTo(routeName, params, queryParams) {
      this.history.push((0, _generateUrl.routerStateToUrl)(this, {
        routeName: routeName,
        params: params,
        queryParams: queryParams
      }));
    }
  }, {
    key: "getRoute",
    value: function getRoute(routeName) {
      return this.routes[routeName] || null;
    }
  }, {
    key: "getCurrentPath",
    value: function getCurrentPath() {
      return this.location.pathname;
    }
    /*
     * History methods
     */

  }, {
    key: "push",
    value: function push(location) {
      this.history.push(location);
    }
  }, {
    key: "replace",
    value: function replace(location) {
      this.history.replace(location);
    }
  }, {
    key: "go",
    value: function go(n) {
      this.history.go(n);
    }
  }, {
    key: "goBack",
    value: function goBack() {
      this.history.goBack();
    }
  }, {
    key: "goForward",
    value: function goForward() {
      this.history.goForward();
    }
  }]);

  return RouterStore;
}(), _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "location", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return null;
  }
}), _applyDecoratedDescriptor(_class.prototype, "_updateLocation", [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, "_updateLocation"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "onMatch", [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, "onMatch"), _class.prototype)), _class);
/**
 * Class for Route.
 */

exports.RouterStore = RouterStore;

var Route =
/*#__PURE__*/
function () {
  /**
   * @var {string}
   */

  /**
   * Component can be React.Component or function that returns renderable object.
   *
   * For a function we have always 2 arguments:
   * - params    - route url params and queryParams
   * - rootStore - rootStore object
   *
   * ```
   *  function (params, rootStore) {
   *      const promise = fetch('/post/' + params.id);
   *      return (<Post postId={params.id} data={promise} />);
   *  }
   * ```
   *
   * @see [[RouterStore.onMatch]]
   * @var {React.Component|function}
   */

  /**
   * @var {string}
   */
  // lifecycle methods

  /**
   * @var {object}
   */

  /**
   * @var {object}
   */
  function Route() {
    var _this = this;

    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Route);

    this.slot = 'default';
    this["final"] = true;
    this.isActive = false;
    this.component = null;
    this.pattern = null;
    this.beforeEnter = void 0;
    this.onExit = void 0;
    this.defaultParams = {};
    this.subroutes = {};
    Object.keys(props).forEach(function (propKey) {
      if (_this.hasOwnProperty(propKey)) {
        _this[propKey] = props[propKey];
      }
    });

    if (this.pattern.substring(0, 1) !== '/') {
      this.pattern = '/' + this.pattern;
    }
  }

  _createClass(Route, [{
    key: "checkPath",
    value: function checkPath(pathname) {//
    }
  }]);

  return Route;
}();

exports.Route = Route;

var RouterState = function RouterState() {
  var _this2 = this;

  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, RouterState);

  this.routeName = void 0;
  this.params = {};
  this.queryParams = {};
  Object.keys(props).forEach(function (propKey) {
    if (_this2.hasOwnProperty(propKey)) {
      _this2[propKey] = props[propKey];
    }
  });
};

exports.RouterState = RouterState;