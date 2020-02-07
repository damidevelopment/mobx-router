import { parse as parseQuery } from 'query-string';
import { createBrowserHistory } from 'history';
import { RouterStore } from './router-store';
import { syncHistoryWithStore } from './sync';
import {
    getObjectKeys,
    buildRoutesAndViewSlots,
    buildLookupPath,
    buildParamsObject,
    buildFnsArray,
    isPromise
} from './utils';
import { action as mobxAction, toJS } from 'mobx';

export const startRouter = (views, rootStore, { resources, runAllEvents = false, ...config } = {}) => {
    const store = new RouterStore();

    typeof rootStore === 'function'
        ? (rootStore = rootStore(store))
        : (rootStore.routerStore = store);

    const browserHistory = createBrowserHistory();
    const history = syncHistoryWithStore(browserHistory, store);

    const { routes, currentView } = buildRoutesAndViewSlots(views);
    store.configure({ ...config, routes, currentView });

    const getPropValuesFromArray = (objArr, prop) =>
        objArr.reduce((arr, obj) => {
            arr.push(obj[prop]);
            return arr;
        }, []);

    const buildAction = (fn) => {
        let runAction;

        if (typeof fn === 'string') {
            let path = fn.split('.');
            let obj = path[0];
            let action = path[1];

            if (resources.hasOwnProperty(obj) && typeof resources[obj][action] === 'function') {
                runAction = resources[obj][action];
            }
            else {
                runAction = () => {
                    console.error('Resource "', path.join('.'), '" does not exists!');
                    return Promise.resolve();
                }
            }
        }
        else if (typeof fn === 'function') {
            runAction = fn;
        }

        return runAction;
    };

    const apply = (task, params) => {
        const runAction = buildAction(task);
        const result = typeof runAction === 'function'
            ? runAction(params, rootStore)
            : null;

        return (isPromise(result) ? result : Promise.resolve(result))
    };

    history.subscribe((location, action) => {
        const matchedRoutes = getObjectKeys(store.routes).reduce((arr, routeName) => {
            const route = store.routes[routeName];
            const keys = route.path.match(location.pathname);

            if (keys) {
                let params = {
                    ...buildParamsObject(keys, route.path.tokens, route.defaultParams),
                    ...parseQuery(location.search)
                };

                arr.push({ route, params });
            }

            return arr;
        }, []);

        // TODO: if more than one route is matched, what to do?
        // if (matchedRoutes.length > 1) {
        // }

        let match = matchedRoutes.shift();

        // TODO: when 404 happens, should we redirect or replace?
        // default redirect
        if (!match) {
            console.error('404 Not Found!');
            store.goTo('notFound');
            return;
            // route = store.routes.notFound;
        }

        store.nextState = {
            routeName: match.route.pathname,
            params: toJS(match.params),
        };

        // build new path for matched route
        let newPath = [];

        if (match.route.fallbackState === null) {
            match.route.fallbackState = store.currentRoute ? {
                routeName: store.currentRoute.pathname,
                params: toJS(store.params),
            } : match.route.defaultState;
        }

        if (match.route.fallbackState) {
            let { routeName, params } = match.route.fallbackState;
            let route = store.routes[routeName];
            if (route) {
                newPath = newPath.concat(buildLookupPath(route));
                match.params = { ...params, ...match.params };
            }
        }

        newPath = newPath.concat(buildLookupPath(match.route));
        newPath = [...new Set(newPath)];// remove duplicates

        const currentRoute = buildLookupPath(store.currentRoute);

        // add routes from previous path for onExit event to be triggered
        let oldPath = currentRoute.reverse().filter(route => route.isActive && !newPath.includes(route));

        if (!runAllEvents) {
            newPath = newPath.filter((route, i) => {
                return (route.isActive && currentRoute.includes(route) && route.final && i === newPath.length - 1)
                    || !route.isActive
                    || (i === newPath.length - 1 && route === store.currentRoute);
            });
        }

        // build params
        const pathParams = newPath.reduce((obj, route) => {
            return { ...route.defaultParams, ...obj };
        }, match.params);

        if (newPath.length > 0 && oldPath.length > 0 && newPath[newPath.length - 1].slot !== oldPath[0].slot && oldPath[0].fallbackState !== false) {
            let { routeName } = oldPath[0].fallbackState;
            let route = store.routes[routeName];
            let contextOldPath = buildLookupPath(route).reverse().filter(route => route.isActive);
            oldPath = oldPath.concat(contextOldPath);
        }

        // build fns
        let fns = buildFnsArray(...getPropValuesFromArray(oldPath, 'onExit'));

        for (let i = 0; i < newPath.length; i++) {
            let route = newPath[i];
            fns = fns.concat(
                buildFnsArray(
                    route.beforeEnter,
                    (runAllEvents && route.isActive && newPath.length - 1 !== i)
                    || ((params, rootStore) => void store.onMatch(params, rootStore, route))
                )
            );
        }

        // invoke fns
        // @see https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
        fns.reduce((promiseChain, currentTask) => {
            return promiseChain.then(
                chainResults =>
                    apply(currentTask, chainResults)
                        .then(currentResult => ({ ...chainResults, ...currentResult }))
            );
        }, Promise.resolve(pathParams))
            .then(
                mobxAction(() => {
                    // set current route and params
                    store.currentRoute = match.route;
                    store.params = pathParams;

                    // set previous location
                    store.previousLocation = location;
                }),
                // TODO: handle rejected promise
                (...args) => {
                    newPath.forEach(route => route.isActive = false);
                    return Promise.resolve();
                }
            )
            // finally
            .then(() => {
                oldPath.forEach(route => {
                    if (route.fallbackState !== false && route.fallbackState.routeName === store.currentRoute.pathname) {
                        route.fallbackState = null;
                    }
                    route.isActive = false;
                });
            });
    }); // history.subscribe end
}
