"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouterState = exports.Route = exports.RouterStore = void 0;

var _mobx = require("mobx");

var _generateUrl = require("./generate-url");

var _class, _descriptor, _descriptor2, _temp;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

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

    _initializerDefineProperty(this, "params", _descriptor2, this);

    this.currentView = null;
    this.history = null;
    this.routes = null;
    this._nextState = null;
    this._previousState = null;
    this._previousLocation = null;
    this._currentRoute = null;
    this.slot = null;
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
      var slot = route.slot; // change currentView only when slot exists and component is not empty

      if (this.currentView.hasOwnProperty(slot) && route.component != null) {
        // @intentionaly !=
        this.currentView[slot] = function () {
          return typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
        };
      }
    }
  }, {
    key: "goTo",
    value: function goTo(routeName, params, queryParams) {
      var url = this.createUrlFromState({
        routeName: routeName,
        params: params,
        queryParams: queryParams
      });
      this.history.push(url);
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
    } // routes history

  }, {
    key: "createUrlFromState",

    /**
     * Converts the supplied state to a URL
     * @param {RouterState|string} state
     * @returns {string}
     */
    value: function createUrlFromState(toState) {
      if (typeof toState === 'string') {
        toState = {
          routeName: toState,
          params: {},
          queryParams: {}
        };
      }

      return (0, _generateUrl.routerStateToUrl)(this, toState);
    }
    /*
     * History methods
     */

  }, {
    key: "push",
    value: function push(routeName) {
      var location = this.routes.hasOwnProperty(routeName) ? this.createUrlFromState({
        routeName: routeName
      }) : routeName;
      this.history.push(location);
    }
  }, {
    key: "replace",
    value: function replace(routeName) {
      var location = this.routes.hasOwnProperty(routeName) ? this.createUrlFromState({
        routeName: routeName
      }) : routeName;
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
  }, {
    key: "nextState",
    get: function get() {
      return this._nextState;
    },
    set: function set(toState) {
      this._nextState = _objectSpread({}, toState);
    }
  }, {
    key: "currentState",
    get: function get() {
      if (!this._currentRoute) {
        return null;
      }

      return {
        routeName: this._currentRoute.pathname,
        params: (0, _mobx.toJS)(this.params)
      };
    }
  }, {
    key: "previousState",
    get: function get() {
      return this._previousState;
    }
  }, {
    key: "currentRoute",
    get: function get() {
      return this._currentRoute;
    },
    set: function set(newRoute) {
      if (this._currentRoute && this._currentRoute["final"]) {
        this._previousState = {
          routeName: this._currentRoute.pathname,
          params: (0, _mobx.toJS)(this.params)
        };
        this._nextState = null;
      }

      this._currentRoute = newRoute;
    } // obsolete?

  }, {
    key: "previousLocation",
    set: function set(location) {
      this._previousLocation = location;
    } // obsolete?
    ,
    get: function get() {
      return this._previousLocation;
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
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "params", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return {};
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
    this.name = null;
    this.pattern = '';
    this._beforeEnter = [];
    this._onExit = [];
    this.defaultParams = {};
    this.subroutes = {};
    this.path = {};
    this._fallbackState = false;
    this.defaultState = {};
    Object.keys(props).forEach(function (propKey) {
      if (_this.hasOwnProperty(propKey)) {
        _this[propKey] = props[propKey];
      }
    });

    if (this.pattern.substring(0, 1) !== '/') {
      this.pattern = '/' + this.pattern;
    }

    this.beforeEnter = props.beforeEnter;
    this.onExit = props.onExit;
  }

  _createClass(Route, [{
    key: "pathname",
    get: function get() {
      var route = this;
      var path = [route.name];

      while (route = route.parent) {
        path.push(route.name);
      }

      return path.filter(function (i) {
        return i;
      }).reverse().join('.');
    }
  }, {
    key: "fallbackState",
    set: function set(state) {
      if (typeof state === 'string') {
        state = {
          routeName: state
        };
      }

      if (state !== null && _typeof(state) !== 'object') {
        state = false;
      }

      this._fallbackState = state;
    },
    get: function get() {
      return this._fallbackState;
    }
  }, {
    key: "beforeEnter",
    set: function set(arr) {
      if (typeof arr === 'function' || typeof arr === 'string') {
        arr = [arr];
      }

      if (Array.isArray(arr)) {
        this._beforeEnter = this._beforeEnter.concat(arr);
      }
    },
    get: function get() {
      return this._beforeEnter;
    }
  }, {
    key: "onExit",
    set: function set(arr) {
      if (typeof arr === 'function' || typeof arr === 'string') {
        arr = [arr];
      }

      if (Array.isArray(arr)) {
        this._onExit = this._onExit.concat(arr);
      }
    },
    get: function get() {
      return this._onExit;
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