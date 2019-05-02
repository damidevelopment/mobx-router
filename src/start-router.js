import { Router } from 'director/build/director';
import { viewsForDirector, noopAsync, compileAsyncAction, compileSyncAction, getObjectKeys, buildFnsArray, dummyFn } from './utils';
import { RouterStore } from './router-store';

const routeBeforeExit = (rootStore, director) =>
    (...args) => {
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
    routerStore.handler = (route) => director.setRoute(route);

    director.configure({
        recurse: 'forward',
        async: true,
        html5history: true,
        before:   buildFnsArray(onEnter).map((fn) => compileSyncAction(rootStore, fn)),
        after:    buildFnsArray(routeBeforeExit(rootStore, director))
                    .concat(buildFnsArray(onExit).map((fn) => compileSyncAction(rootStore, fn))),
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
        const key = [parentKey, viewKey].filter(foo => !!foo).join('.');

        obj[key] = {
            slot: view.slot,
            path: [
                parent ? parent.path : null,
                view.path
            ].filter(foo => !!foo).join('')
        };

        const subroutes = buildRoutes(view.subroutes, { parentKey: viewKey, parent: view });
        return getObjectKeys(subroutes).reduce((obj, key) => {
            obj[key] = subroutes[key];
            return obj;
        }, obj);
    }, {});

export const startRouter = (views, rootStore, config) => {
    rootStore.routerStore = new RouterStore({ routes: buildRoutes(views) });

    //create director configuration
    createDirectorRouter(views, rootStore, config);
};
