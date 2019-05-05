import { observable, action, toJS } from 'mobx';
import { routerStateToUrl } from './generate-url';

export class RouterStore
{
    @observable params = {};
    @observable queryParams = {};

    @observable currentView = {
        default: null,
        content: null
    };

    // matched Route object
    currentRoute = null;

    // setRoute callback from director
    handler = null;

    constructor({ routes, currentView }) {
        this.routes = routes;
        this.goTo = this.goTo.bind(this);

        if (currentView) {
            this.currentView = observable(currentView);
        }
    }

    goTo(routerState, params, queryParams) {
        if (typeof routerState === 'string') {
            routerState = new RouterState({
                routeName: routerState,
                params: toJS(params),
                queryParams: toJS(queryParams)
            });
        }
        this.handler(routerStateToUrl(this, routerState));
    }

    getRoute(routeName) {
        return this.routes[routeName] || null;
    }

    @action
    onMatch(rootStore, view) {
        // change currentView only when slot exists and component is not empty
        if (this.currentView.hasOwnProperty(view.slot) && view.component != null) {// @intentionaly !=
            this.currentView[view.slot] = () =>
                typeof view.component === 'function' ? view.component(this.getRouteParams(), rootStore) : view.component;
        }
    }

    getRouteParams() {
        return { ...toJS(this.params), ...toJS(this.queryParams) };
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
    pattern;

    // lifecycle methods
    beforeEnter;
    beforeExit;

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
    }
}
