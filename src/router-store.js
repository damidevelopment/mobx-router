import { observable, action } from 'mobx';
import { routerStateToUrl } from './generate-url';

/**
 * Class for RouterStore
 */
export class RouterStore
{
    @observable location = null;

    currentView = null;

    history = null;
    routes = null;
    currentRoute = null;

    lock = null;

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

        let slot = typeof this.lock === 'string'
            ? this.lock
            : Array.isArray(route.slot) ? route.slot[0] : route.slot;

        // change currentView only when slot exists and component is not empty
        if (this.currentView.hasOwnProperty(slot) && route.component != null) {// @intentionaly !=
            console.log('onMatch.real', slot);
            this.currentView[slot] = () =>
                typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
        }
    }

    goTo(routeName, params, queryParams) {
        this.history.push(routerStateToUrl(this, {
            routeName, params, queryParams
        }));
    }

    getRoute(routeName) {
        return this.routes[routeName] || null;
    }

    getCurrentPath() {
        return this.location.pathname;
    }

    /*
     * History methods
     */

    push(location, { lock = null }) {
        this.lock = lock;
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
    pattern = null;

    // lifecycle methods
    beforeEnter;
    onExit;

    /**
     * @var {object}
     */
    defaultParams = {};

    /**
     * @var {object}
     */
    subroutes = {};


    constructor(props = {}) {
        Object.keys(props).forEach((propKey) => {
            if (this.hasOwnProperty(propKey)) {
                this[propKey] = props[propKey];
            }
        });

        if (this.pattern.substring(0, 1) !== '/') {
            this.pattern = '/' + this.pattern;
        }

        if (!Array.isArray(this.slot)) {
            this.slot = [this.slot];
        }
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
