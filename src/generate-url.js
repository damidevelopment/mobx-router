/*
 * Credits to https://github.com/nareshbhatia/mobx-state-router
 */

import { compile } from 'path-to-regexp';
import { stringify } from 'query-string';

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

    if (!route) {
        return '#(no route found for ' + toState.routeName + ')';
    }

    const params = {
        ...routerStore.params,
        ...toState.params,
        ...route.defaultParams,
    };

    const queryParams = {
        ...toState.queryParams
    };

    return generateUrl(route.pattern, params, queryParams);
};
