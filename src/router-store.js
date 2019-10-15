import { observable, action } from 'mobx';
import { routerStateToUrl } from './generate-url';

/**
 * Class for RouterStore
 */
export class RouterStore
{
    @observable location = null;

    params = {};

    currentView = null;

    history = null;
    routes = null;

    _previousLocation = null;

    _currentRoute = null;
    _previousRoute = null;

    slot = null;

    /**
     * RouterStore constructor
     */
    constructor() {
        this.push = this.push.bind(this);
        this.replace = this.replace.bind(this);
        this.go = this.go.bind(this);
        this.goBack = this.goBack.bind(this);
        this.goForward = this.goForward.bind(this);
    }

    configure({ routes, currentView }) {
        if (this.routes !== null) {
            return;
        }

        this.routes = routes;
        this.currentView = observable(currentView);
    }

    @action
    _updateLocation(newState) {
        this.location = newState;
    }

    @action
    onMatch(params, rootStore, route) {
        route.isActive = true;

        const slot = route.slot;

        // change currentView only when slot exists and component is not empty
        if (this.currentView.hasOwnProperty(slot) && route.component != null) {// @intentionaly !=
            this.currentView[slot] = () =>
                typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
        }
    }

    goTo(routeName, params, queryParams) {
        const url = this.createUrlFromState({ routeName, params, queryParams });
        this.history.push(url);
    }

    getRoute(routeName) {
        return this.routes[routeName] || null;
    }

    getCurrentPath() {
        return this.location.pathname;
    }

    // routes history

    set currentRoute(newRoute) {
        if (this._currentRoute && this._currentRoute.final) {
            this._previousRoute = this._currentRoute;
        }
        this._currentRoute = newRoute;
    }

    get currentRoute() {
        return this._currentRoute;
    }

    get previousRoute() {
        return this._previousRoute;
    }

    set previousLocation(location) {
        this._previousLocation = location;
    }

    get previousLocation() {
        return this._previousLocation;
    }

    /**
     * Converts the supplied state to a URL
     * @param {RouterState|string} state
     * @returns {string}
     */
    createUrlFromState(toState) {
        if (typeof toState === 'string') {
            toState = { routeName: toState, params: {}, queryParams: {} };
        }
        return routerStateToUrl(this, toState);
    }

    /*
     * History methods
     */

    push(location) {
        this.history.push(location);
    }

    replace(location) {
        this.history.replace(location);
    }

    go(n) {
        this.history.go(n);
    }

    goBack() {
        this.history.goBack();
    }

    goForward() {
        this.history.goForward();
    }
}

/**
 * Class for Route.
 */
export class Route
{
    /**
     * @var {string}
     */
    slot = 'default';

    final = true;
    isActive = false;

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
    component = null;

    /**
     * @var {string}
     */
    pattern = '';

    // lifecycle methods
    _beforeEnter = [];
    _onExit = [];

    /**
     * @var {object}
     */
    defaultParams = {};

    /**
     * @var {object}
     */
    subroutes = {};

    _context = false;
    _defaultContext = {};

    constructor(props = {}) {
        Object.keys(props).forEach((propKey) => {
            if (this.hasOwnProperty(propKey)) {
                this[propKey] = props[propKey];
            }
        });

        if (this.pattern.substring(0, 1) !== '/') {
            this.pattern = '/' + this.pattern;
        }
    }

    set context(state) {
        if (!state) {
            this._context = false;
            return void 0;
        }
        if (typeof state === 'string') {
            state = { routeName: state };
        }
        this._context = { ...state };
    }

    get context() {
        return this._context;
    }

    set beforeEnter(arr) {
        if (typeof arr === 'function') {
            arr = [arr];
        }
        if (Array.isArray(arr)) {
            this._beforeEnter = this._beforeEnter.concat(arr);
        }
    }

    get beforeEnter() {
        return this._beforeEnter;
    }

    set onExit(arr) {
        if (typeof arr === 'function') {
            arr = [arr];
        }
        if (Array.isArray(arr)) {
            this._onExit = this._onExit.concat(arr);
        }
    }

    get onExit() {
        return this._onExit;
    }
}

export class RouterState
{
    routeName;
    params = {};
    queryParams = {};

    constructor(props = {}) {
        Object.keys(props).forEach((propKey) => {
            if (this.hasOwnProperty(propKey)) {
                this[propKey] = props[propKey];
            }
        });
    }
}
