"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Route = exports.RouterState = exports.RouterStore = void 0;

var _mobx = require("mobx");

var _generateUrl = require("./generate-url");

var _dec, _class, _descriptor, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

var RouterStore = (_dec = _mobx.action.bound, (_class = (_temp =
/*#__PURE__*/
function () {
  // matched Route object
  // setRoute callback from director
  function RouterStore(_ref) {
    var routes = _ref.routes;

    _classCallCheck(this, RouterStore);

    _initializerDefineProperty(this, "currentView", _descriptor, this);

    this.currentRoute = null;
    this.handler = null;
    this.routes = routes;
    this.goTo = this.goTo.bind(this);
  }

  _createClass(RouterStore, [{
    key: "goTo",
    value: function goTo(routerState) {
      this.handler((0, _generateUrl.routerStateToUrl)(this, routerState));
    }
  }, {
    key: "getRoute",
    value: function getRoute(routeName) {
      return this.routes[routeName] || null;
    }
  }, {
    key: "onMatch",
    value: function onMatch(params, rootStore) {
      var route = this.currentRoute;

      this.currentView[route.slot] = function () {
        return typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
      };
    }
  }]);

  return RouterStore;
}(), _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "currentView", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return {
      "default": null,
      content: null
    };
  }
}), _applyDecoratedDescriptor(_class.prototype, "onMatch", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "onMatch"), _class.prototype)), _class));
exports.RouterStore = RouterStore;

var RouterState = function RouterState() {
  var _this = this;

  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, RouterState);

  this.routeName = void 0;
  this.params = {};
  this.queryParams = {};
  Object.keys(props).forEach(function (propKey) {
    if (_this.hasOwnProperty(propKey)) {
      _this[propKey] = props[propKey];
    }
  });
};

exports.RouterState = RouterState;

var Route =
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
function Route() {
  var _this2 = this;

  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Route);

  this.slot = 'default';
  this.component = void 0;
  this.path = void 0;
  this.beforeEnter = void 0;
  this.beforeExit = void 0;
  this.subroutes = {};
  Object.keys(props).forEach(function (propKey) {
    if (_this2.hasOwnProperty(propKey)) {
      _this2[propKey] = props[propKey];
    }
  });

  if (this.path.substring(0, 1) !== '/') {
    this.path = '/' + this.path;
  }
};

exports.Route = Route;