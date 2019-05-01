import { isPromiseBasedObservable } from 'mobx-utils';

const isPromise = (obj) => obj && typeof obj.then === 'function';
const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

export const getObjectKeys = (obj) => (isObject(obj) ? Object.keys(obj) : []);

export const noopAsync = (...args) => {
    const next = args.pop();
    next();
};

export const buildFnsArray = (...args) => {
    const arr = [];
    return arr.concat.apply(arr, args).filter(fn => typeof fn === 'function');
}

export const compileSyncAction = (rootStore, callback) =>
    (...args) => {
        const next = args.pop();
        callback(args, rootStore);
        next();
    }

export const compileAsyncAction = (rootStore, callback) =>
    (...args) => {
        const next = args.pop();
        const result = callback(args, rootStore);

        // @see mobx-utils fromPromise
        if (isPromiseBasedObservable(result)) {
            result.case(
                () => {},
                (err) => next(err),
                () => next()
            );
        }
        else if (isPromise(result)) {
            result.then(
                () => next(),
                (err) => next(err)
            );
        }
        else {
            next();
        }
    };

const setCurrentRoute = (routerStore, view) =>
    (...args) => {
        const next = args.pop();
        routerStore.currentRoute = view;
        next();
    };

export const viewsForDirector = (views, rootStore) =>
    getObjectKeys(views).reduce((obj, viewKey) => {
        const view = views[viewKey];
        const routerStore = rootStore.routerStore;

        obj[view.path] = {
            ...viewsForDirector(view.subroutes, rootStore),
            on: buildFnsArray(view.beforeEnter)
                .map((fn) => compileAsyncAction(rootStore, fn))
                .concat(setCurrentRoute(routerStore, view), routerStore.onMatch)
        };

        return obj;
    }, {});
