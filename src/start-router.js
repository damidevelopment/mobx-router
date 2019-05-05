import { Router } from 'director/build/director';
import {
    viewsForDirector,
    noopAsync,
    compileAsyncAction,
    compileSyncAction,
    getObjectKeys,
    buildFnsArray,
    buildParamsObject,
    getQuery
} from './utils';
import { RouterStore } from './router-store';

const routeBeforeExit = (rootStore, director) =>
    (...args) => {
        noopAsync.apply(undefined, args);
        return;

        const routerStore = rootStore.routerStore;
        const view = routerStore.currentRoute;

        if (view.beforeExit == null) {// @intentionaly ==
            noopAsync.apply(undefined, args);
        } else {
            let next = args.pop();
            let fns = buildFnsArray(view.beforeExit).map((fn) => compileAsyncAction(rootStore, fn));
            director.invoke(fns, director, next);
        }
    };

const setCurrentRoute = (routerStore) =>
    (...args) => {
        const next = args.pop();

        for (const name in routerStore.routes) {
            let route = routerStore.routes[name];
            const params = buildParamsObject(route.pattern, route.defaultParams);

            if (params) {
                routerStore.params = params;
                routerStore.queryParams = getQuery();
                routerStore.currentRoute = route;
                break;
            }
        }
        next();
    };

/**
 * Initialize and cofigure director router
 *
 * @param  {object}               views             List of routes and subroutes
 * @param  {object|RootStore}     rootStore         App rootStore object
 * @param  {function|function[]}  options.onEnter   Action or list of Actions
 * @param  {function|function[]}  options.onExit    Action or list of Actions
 * @param  {function}             options.notFound  Not found Action
 * @return {void}
 */
const createDirectorRouter = (views, rootStore, { onEnter, onExit, notFound, resource } = {}) => {
    const director = new Router({ ...viewsForDirector(views, rootStore) });
    const routerStore = rootStore.routerStore;

    // handler for changing routes
    routerStore.handler = director.setRoute.bind(director);

    director.configure({
        recurse: 'forward',
        async: true,
        html5history: true,
        before: [setCurrentRoute(routerStore)].concat(
            buildFnsArray(onEnter).map((fn) => compileSyncAction(rootStore, fn))
        ),
        after: buildFnsArray(onExit).map((fn) => compileSyncAction(rootStore, fn)),
        notfound: compileSyncAction(rootStore, notFound),
        resource: getObjectKeys(resource).reduce((obj, name) => {
            let fn  = resource[name];
            obj[name] = compileAsyncAction(rootStore, fn);
            return obj;
        }, {})
    });
    director.init();
};

const buildRoutes = (views, { parentKey, parent } = {}) =>
    getObjectKeys(views).reduce((obj, viewKey) => {
        const view = views[viewKey];
        const key = [parentKey, viewKey].filter(Boolean).join('.');

        let pattern = [
            parent ? parent.pattern : null,
            view.pattern
        ]
            .filter(Boolean)
            .join('')
            .replace(/(\/\/+|\/\?)/g, '/');

        obj[key] = {
            view,
            pattern
        };

        const subroutes = buildRoutes(view.subroutes, { parentKey: viewKey, parent: view });
        return getObjectKeys(subroutes).reduce((obj, key) => {
            obj[key] = subroutes[key];
            return obj;
        }, obj);
    }, {});

export const startRouter = (views, rootStore, { currentView, ...config }) => {
    const routes = buildRoutes(views);
    rootStore.routerStore = new RouterStore({ routes, currentView });

    //create director configuration
    createDirectorRouter(views, rootStore, config);
};
