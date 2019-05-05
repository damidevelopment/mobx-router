import { isPromiseBasedObservable } from 'mobx-utils';
import { default as pathToRegexp, parse as parsePath } from 'path-to-regexp';
import { parse as parseQuery } from 'query-string';

const isPromise = (obj) => obj && typeof obj.then === 'function';
const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

export const getObjectKeys = (obj) => (isObject(obj) ? Object.keys(obj) : []);

export const noopAsync = (...args) => {
    const next = args.pop();
    next();
};

export const buildFnsArray = (...args) => {
    const arr = [];
    return arr.concat.apply(arr, args).filter(fn => typeof fn === 'function' || typeof fn === 'string');
}

export const compileSyncAction = (rootStore, callback) => {
    if (typeof callback === 'string' && callback !== '') {
        return callback;
    }

    if (typeof callback !== 'function') {
        return noopAsync;
    }

    return (...args) => {
        const next = args.pop();
        callback(args, rootStore);
        next();
    }
}

export const compileAsyncAction = (rootStore, callback) => {
    if (typeof callback === 'string' && callback !== '') {
        return callback;
    }

    if (typeof callback !== 'function') {
        return noopAsync;
    }

    return (...args) => {
        const next = args.pop();
        const result = callback(args, rootStore);

        // @see mobx-utils fromPromise
        if (isPromiseBasedObservable(result)) {
            result.case(
                () => {},
                (err) => next(false),
                () => next()
            );
        }
        else if (isPromise(result)) {
            result.then(
                () => next(),
                (err) => next(false)
            );
        }
        else {
            next();
        }
    }
};

export const getQuery = function () {
    const query = window.location.search;
    return parseQuery(query);
};

export const getPath = function () {
    const path = window.location.pathname;
    if (path.substr(0, 1) !== '/') {
        path = '/' + path;
    }
    return path;
};

export const buildParamsObject = (pattern, defaultParams = {}) => {
    const path = getPath();
    const params = pathToRegexp(pattern).exec(path);

    if (!params) {
        return null;
    }

    params.shift();
    const tokens = parsePath(pattern);

    // in best case scenario tokens.length === params.length and token indexes match params indexes
    // Known issues:
    // There are 2 scenarios which are not included in this solution and should be fixed.
    // - repeat pattern, single token for multiple parsed params
    //   `/:foo(\d)+` => `/123/456` => ['123', '456']
    //   should resolve { foo: ['123', '456'] }, but resolves { foo: '123' }
    // - optionals inside pattern
    //   `/:lang(cs|en)?/:bar` => /bar => ['bar']
    //   should resolve { lang: null, bar: 'bar' }, but resolves { lang: 'bar', bar: null }
    return tokens.filter((token) => typeof token === 'object').reduce((obj, token, index) => {
        // TODO resolve optionals in the middle of pattern
        obj[token.name] = params[index] || defaultParams[token.name] || null;
        return obj;
    }, {});
}

export const viewsForDirector = (views, rootStore) =>
    getObjectKeys(views).reduce((obj, viewKey) => {
        const view = views[viewKey];
        const routerStore = rootStore.routerStore;

        obj[view.pattern] = {
            ...viewsForDirector(view.subroutes, rootStore),
            on: buildFnsArray(view.beforeEnter).map((fn) => compileAsyncAction(rootStore, fn))
                .concat((...args) => {
                    const next = args.pop();
                    routerStore.onMatch(rootStore, view)
                    next();
                })
        };

        return obj;
    }, {});
