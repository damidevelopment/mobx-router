import { Router } from 'director/build/director';
import { viewsForDirector, noopAsync, getObjectKeys, buildFnsArray, dummyFn } from './utils';
import { RouterStore } from './router-store';

const routeBeforeExit = (routerStore, director) =>
    (...args) => {
        const view = routerStore.currentRoute;

        if (view.beforeExit == null) {// @intentionaly ==
            noopAsync.apply(undefined, args);
        } else {
            let next = args.pop();
            director.invoke(buildFnsArray(view.beforeExit), director, next);
        }
    };

const createDirectorRouter = (views, routerStore, config) => {
    const director = new Router({ ...viewsForDirector(views, routerStore) });

    // handler for changing routes
    routerStore.handler = (route) => director.setRoute(route);

    director.configure({
        recurse: 'forward',
        async: true,
        html5history: true,
        before:   [/*dummyFn('Director.beforeRoute')*/],
        after:    [routeBeforeExit(routerStore, director), dummyFn('Director.afterRoute')],
        notfound: dummyFn('Director.notFoundRoute')// must be function only
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

export const startRouter = (views, config) => {
    const router = new RouterStore({ routes: buildRoutes(views) });

    //create director configuration
    createDirectorRouter(views, router, config);

    return router;
};
