import { parse as parseQuery } from 'query-string';
import {
    getObjectKeys,
    buildRoutes,
    buildLookupPath,
    buildParamsObject,
    buildFnsArray,
    isPromise
} from './utils';

const getPropValuesFromArray = (objArr, prop) =>
    objArr.reduce((arr, obj) => {
        arr.push(obj[prop]);
        return arr;
    }, []);

const compileSyncAction = (callback) => {
    return (...args) => {
        callback(...args);
    };
}

export const startRouter = (views, store, rootStore) => {
    store.routes = buildRoutes(views);

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

        matchedRoutes.forEach(route => console.log('whoooo', route));

        if (matchedRoutes.length > 1) {
            // TODO: if more than one route is matched, what to do?
        }

        let match = matchedRoutes.shift();

        // store.setParams(match.params);

        // add only routes that are not currently active
        const newPath = buildLookupPath(match.route)
            .filter(route => !route.isActive);

        // add routes from previous path for onExit calls
        const oldPath = buildLookupPath(store.currentRoute)
            .filter(route => !newPath.includes(route));

        // console.log('lookup', newPath, oldPath);

        // build fns
        let fns = buildFnsArray(...getPropValuesFromArray(oldPath, 'onExit'))
            .map(fn => compileSyncAction(fn));

        for (let i = 0; i < newPath.length; i++) {
            let route = newPath[i];
            fns = fns.concat(
                buildFnsArray(route.beforeEnter, () => {
                    store.onMatch(rootStore, route);
                })
            );
        }

        console.log('callback fns', fns);

        // TODO: when 404 happens, should we redirect or replace?
        // default redirect
        if (!match) {
            console.log('404 Not Found!');
            // store.goTo('notFound');
            return;
            // route = store.routes.notFound;
        }

        // invoke fns
        const apply = (task, params) => {
            let runAction;

            if (typeof task === 'string') {
                // TODO resources
                runAction = () => {
                    console.log('TODO: When task is String, look into resources!');
                    return Promise.resolve();
                }
            }
            else if (typeof task === 'function') {
                runAction = task;
            }

            const result = typeof runAction === 'function'
                ? runAction(params, rootStore)
                : null;

            return (isPromise(result) ? result : Promise.resolve(result))
        };

        // @see https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
        fns.reduce((promiseChain, currentTask) => {
            return promiseChain.then(
                chainResults =>
                    apply(currentTask, chainResults)
                        .then(currentResult => ({ ...chainResults, ...currentResult }))
            );
        }, Promise.resolve({}))
            //
            // TODO: what to do on success?
            //
            // .then((arrayOfResults) => {
            //     // Do something with all results
            //     console.log('arrayOfResults', arrayOfResults);
            // })
            //
            // TODO: handle rejected promise
            //
            // .catch((...args) => console.log('catch', args))
            ;

    }); // history.subscribe end
}
