/*
 * Credits to https://github.com/nareshbhatia/mobx-state-router
 */

import { compile } from 'path-to-regexp';
import { stringify } from 'query-string';
import { toJS } from 'mobx';

const generatorCache = {};

export const getGenerator = (pattern) => {
    const generator = generatorCache[pattern];
    if (generator) {
        return generator;
    }

    const compiledGenerator = compile(pattern);
    generatorCache[pattern] = compiledGenerator;

    return compiledGenerator;
};

/**
 * Generates a URL from a pattern and parameters.
 * For example,
 *     generateUrl('/departments/:id', { id: 'electronics' })
 *     => '/departments/electronics'
 */
export const generateUrl = (pattern = '/', params = {}, queryParams = {}) => {
    // remove special chars, from patterns like '/$'
    pattern = pattern.replace(/|\$/, '');
    // replace repeating slashes
    pattern = pattern.replace(/\/\/+/, '/');

    // inject params
    const generator = getGenerator(pattern);
    let url = generator(params);

    // inject queryParams (remember to insert the question mark)
    if (Object.keys(queryParams).length > 0) {
        url = `${url}?${stringify(queryParams)}`;
    }

    return url;
};

/**
 * Converts the supplied state to a URL
 * @param {RouterStore} routerStore
 * @param {RouterState} toState
 * @returns {string}
 */
export const routerStateToUrl = (routerStore, toState) => {
    const route = routerStore.getRoute(toState.routeName);

    toState.params = toState.params || {};
    toState.queryParams = toState.queryParams || {};

    if (!route) {
        return '/#(no route found for ' + toState.routeName + ')';
    }

    try {
        const defaultParams = route.defaultParams;
        const pathParams = {};
        const queryParams = {};

        Object.keys(toState.params).forEach((key) => {
            if (!toState.params.hasOwnProperty(key)) {
                return;
            }

            if (route.path.tokens.findIndex(token => token.name === key) > -1) {
                pathParams[key] = toState.params[key];
            }
            else {
                queryParams[key] = toState.params[key];
            }
        });

        const params = {
            ...defaultParams,
            ...toJS(routerStore.params),
            ...pathParams,
        };

        return generateUrl(route.path.pattern, params, { ...queryParams, ...toState.queryParams });
    }
    catch (e) {
        console.error('Missing parameter for route ', '\'' + toState.routeName + '\'', "\n", 'Original Error: ', e.message);
        return '/#(missing param for route ' + toState.routeName + ')';
    }
};
