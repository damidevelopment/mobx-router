"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = void 0;

var _react = _interopRequireDefault(require("react"));

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _routerStore = require("../router-store");

var _generateUrl = require("../generate-url");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var LinkBase =
/*#__PURE__*/
function (_React$Component) {
  _inherits(LinkBase, _React$Component);

  function LinkBase(props) {
    var _this;

    _classCallCheck(this, LinkBase);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LinkBase).call(this, props));
    _this.clickHandler = _this.clickHandler.bind(_assertThisInitialized(_this));

    if (!props.routerStore) {
      console.error('The routerStore prop must be defined for a Link component to work!');
    }

    _this.setRouterState(props);

    _this.linkRef = _react["default"].createRef();
    return _this;
  }

  _createClass(LinkBase, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(newProps) {
      console.log('Link.componentDidUpdate');
      this.setRouterState(newProps);
    }
  }, {
    key: "setRouterState",
    value: function setRouterState(props) {
      if ((0, _utils.isObject)(props.to)) {
        this.toState = new _routerStore.RouterState(_objectSpread({}, props.to));
      } else {
        this.toState = new _routerStore.RouterState({
          routeName: props.to,
          params: props.params,
          queryParams: props.queryParams
        });
      }
    }
  }, {
    key: "clickHandler",
    value: function clickHandler(e) {
      var _this$props = this.props,
          _this$props$refresh = _this$props.refresh,
          refresh = _this$props$refresh === void 0 ? false : _this$props$refresh,
          routerStore = _this$props.routerStore;
      var middleClick = e.button === 2;
      var cmdOrCtrl = e.metaKey || e.ctrlKey;
      var openinNewTab = middleClick || cmdOrCtrl;
      var shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl;

      if (!shouldNavigateManually) {
        e.preventDefault();
        var _this$linkRef$current = this.linkRef.current,
            pathname = _this$linkRef$current.pathname,
            search = _this$linkRef$current.search;
        routerStore.push({
          pathname: pathname,
          search: search
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          params = _this$props2.params,
          queryParams = _this$props2.queryParams,
          refresh = _this$props2.refresh,
          children = _this$props2.children,
          routerStore = _this$props2.routerStore,
          activeClassName = _this$props2.activeClassName,
          props = _objectWithoutProperties(_this$props2, ["params", "queryParams", "refresh", "children", "routerStore", "activeClassName"]);

      if (!routerStore) {
        return null;
      }

      var href = (0, _generateUrl.routerStateToUrl)(routerStore, this.toState);

      if (activeClassName) {
        var index = href.indexOf('?');
        var routePath = href.substr(0, index < 0 ? href.length : index);

        if (routePath === routerStore.getCurrentPath()) {
          props.className = (props.className || '') + ' ' + activeClassName;
        }
      }

      return _react["default"].createElement("a", _extends({
        ref: this.linkRef
      }, props, {
        href: href,
        onClick: this.clickHandler
      }), children);
    }
  }]);

  return LinkBase;
}(_react["default"].Component);

var Link = (0, _mobxReact.inject)('routerStore')((0, _mobxReact.observer)(LinkBase));
exports.Link = Link;