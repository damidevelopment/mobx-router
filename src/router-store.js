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
    onMatch(...args) {
        const next = args.pop();
        let route = this.currentRoute;
        this.currentView[route.slot] = route.component;
        next();
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
