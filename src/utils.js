import pathToRegexp from 'path-to-regexp';

export const isPromise = (obj) => obj && typeof obj.then === 'function';
export const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

export const getObjectKeys = (obj) => (isObject(obj) ? Object.keys(obj) : []);

export const buildRoutesAndViewSlots = (views, { parentKey, parent } = {}) =>
    getObjectKeys(views).reduce((obj, viewKey) => {
        const view = views[viewKey];
        const key = [parentKey, viewKey].filter(Boolean).join('.');

        view.parent = parent || null;

        // TODO: why use final?
        if (view.final) {
            let pattern = [
                parent ? parent.pattern : null,
                view.pattern
            ]
                .filter(Boolean)
                .join('')
                .replace(/(\/\/+|\/\?)/g, '/');

            let tokens = [];
            let regexp = pathToRegexp(pattern, tokens);

            view.path = {
                pattern,
                match: regexp.exec.bind(regexp),
                tokens
            };

            view.defaultParams = { ...view.defaultParams, ...(parent ? parent.defaultParams : {}) };

            obj.routes[key] = view;
        }

        obj.currentView = (Array.isArray(view.slot) ? view.slot : [view.slot]).reduce((res, slot) => {
            res[slot] = null;
            return res;
        }, obj.currentView);

        const result = buildRoutesAndViewSlots(view.subroutes, { parentKey: viewKey, parent: view });
        const subroutes = result.routes;
        obj.currentView = { ...obj.currentView, ...result.currentView };

        return getObjectKeys(subroutes).reduce((obj, key) => {
            obj.routes[key] = subroutes[key];
            return obj;
        }, obj);
    }, { routes: {}, currentView: {} });

export const buildParamsObject = (params, tokens, defaultParams = {}) => {
    if (params.input) {
        params.shift();
    }

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

const buildLookupPathInner = (route) => {
    let path = [];
    if (route) {
        path = path.concat([route], buildLookupPathInner(route.parent));
    }
    return path;
}

export const buildLookupPath = (route, { filterFn, reverse = true } = {}) => {
    let path = buildLookupPathInner(route);
    path = (path.length === 0 ? [route] : path);
    if (Boolean(reverse)) {
        path.reverse();
    }
    return path
        .filter(route => route)/*
        .filter(typeof filterFn === 'function' ? filterFn : () => true)*/;
}

export const buildFnsArray = (...args) => {
    const arr = [];
    return arr.concat.apply(arr, args).filter(fn => typeof fn === 'function' || typeof fn === 'string');
}
