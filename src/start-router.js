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

export const startRouter = (views, rootStore, { resources, ...config } = {}) => {
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

    const compileSyncAction = (callback) => {
        return (...args) => {
            let runAction = buildAction(callback);
            return runAction(...args);
        };
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
                    ...buildParamsObject(keys, route.path.tokens),
                    ...parseQuery(location.search)
                };

                arr.push({ route, params });
            }

            return arr;
        }, []);

        // matchedRoutes
        //     .filter(match => match.route.final)
        //     .forEach(match => console.log('whoooo', match));

        if (matchedRoutes.length > 1) {
            // TODO: if more than one route is matched, what to do?
        }

        let match = matchedRoutes.shift();

        // TODO: when 404 happens, should we redirect or replace?
        // default redirect
        if (!match) {
            console.error('404 Not Found!');
            store.replace('notFound');
            return;
            // route = store.routes.notFound;
        }

        // add only routes that are not currently active
        let newPath = buildLookupPath(match.route);

        // call onExit
        // add routes from previous path for onExit calls
        const oldPath = buildLookupPath(store.currentRoute, { reverse: false })
            .filter(route => route.isActive && !newPath.includes(route));

        // TODO there should be check if route params changed
        newPath = newPath.filter((route, i) => !route.isActive || (i === newPath.length - 1/* && route !== store.currentRoute*/));

        // build fns
        let fns = buildFnsArray(...getPropValuesFromArray(oldPath, 'onExit'))
            /*.map(fn => compileSyncAction(fn))*/;

        for (let i = 0; i < newPath.length; i++) {
            let route = newPath[i];
            fns = fns.concat(
                buildFnsArray(route.beforeEnter, (params, rootStore) => {
                    store.onMatch(params, rootStore, route);
                })
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
        }, Promise.resolve(match.params))
            .then(
                // set currentRoute on success
                () => {
                    store.params = match.params;
                    store.currentRoute = match.route;
                },
                // TODO: handle rejected promise
                (...args) => console.error('Route error:', ...args)
            )
            // finalize
            .then(() => {
                for (let i in oldPath) {
                    oldPath[i].isActive = false;
                }
            });
    }); // history.subscribe end
}
