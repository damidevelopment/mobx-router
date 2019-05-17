import { parse as parseQuery } from 'query-string';
import {
    getObjectKeys,
    buildRoutesAndViewSlots,
    buildLookupPath,
    buildParamsObject,
    buildFnsArray,
    isPromise
} from './utils';

export const startRouter = (views, store, rootStore) => {
    const { routes, currentView } = buildRoutesAndViewSlots(views);
    store.configure({ routes, currentView });

    const getPropValuesFromArray = (objArr, prop) =>
        objArr.reduce((arr, obj) => {
            arr.push(obj[prop]);
            return arr;
        }, []);

    const buildAction = (fn) => {
        let action;

        if (typeof fn === 'string') {
            // TODO resources
            action = () => {
                console.warn('TODO: When task is String, look into resources!');
                return Promise.resolve();
            }
        }
        else if (typeof fn === 'function') {
            action = fn;
        }

        return action;
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

    store.history.subscribe((location, action) => {
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
            console.log('404 Not Found!');
            // store.replace('notFound');
            return;
            // route = store.routes.notFound;
        }

        // add only routes that are not currently active
        let newPath = buildLookupPath(match.route);

        // call onExit
        // add routes from previous path for onExit calls
        const oldPath = buildLookupPath(store.currentRoute, { reverse: false })
            .filter(route => route.isActive && !newPath.includes(route));

        newPath = newPath.filter((route, i) => !route.isActive || (i === newPath.length - 1 && route !== store.currentRoute));

        // console.log('lookup', newPath, oldPath);

        for (let i in oldPath) {
            oldPath[i].isActive = false;
        }

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

        // console.log('callback fns', fns);

        // invoke fns
        // @see https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
        fns.reduce((promiseChain, currentTask) => {
            return promiseChain.then(
                chainResults =>
                    apply(currentTask, chainResults)
                        .then(currentResult => ({ ...chainResults, ...currentResult }))
            );
        }, Promise.resolve(match.params))
            .then((arrayOfResults) => {
                store.currentRoute = match.route;
            })
            // TODO: handle rejected promise
            .catch((...args) => console.log('catch', args));
    }); // history.subscribe end

    rootStore.routerStore = store;
}
