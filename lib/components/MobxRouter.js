"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MobxRouter = void 0;

var _react = _interopRequireDefault(require("react"));

var _mobxReact = require("mobx-react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var MobxRouterBase = function MobxRouterBase(_ref) {
  var routerStore = _ref.routerStore,
      slot = _ref.slot;

  if (!slot) {
    console.error('Slot name for MobxRouter must be set!');
  }

  var viewRender = routerStore.currentView[slot];
  return typeof viewRender === 'function' ? viewRender() : null;
};

var MobxRouter = (0, _mobxReact.inject)('routerStore')((0, _mobxReact.observer)(MobxRouterBase));
exports.MobxRouter = MobxRouter;