import { observable, computed, action, toJS, runInAction } from 'mobx';
import { routerStateToUrl } from './generate-url';

export class RouterStore
{
    @observable currentView = {
        default: null,
        content: null
    };

    // matched Route object
    currentRoute = null;

    // setRoute callback from director
    handler = null;

    constructor({ routes }) {
        this.routes = routes;
        this.goTo = this.goTo.bind(this);
    }

    goTo(routerState) {
        this.handler(routerStateToUrl(this, routerState));
    }

    getRoute(routeName) {
        return this.routes[routeName] || null;
    }

    @action.bound
    onMatch(params, rootStore) {
        let route = this.currentRoute;
        this.currentView[route.slot] = () =>
            typeof route.component === 'function' ? route.component(params, rootStore) : route.component;
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


export class Route
{
    /**
     * @var {string}
     */
    slot = 'default';

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
    component;

    /**
     * @var {string}
     */
    path;

    // lifecycle methods
    beforeEnter;
    beforeExit;

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

        if (this.path.substring(0, 1) !== '/') {
            this.path = '/' + this.path;
        }
    }
}
