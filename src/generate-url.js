/*
 * Credits to https://github.com/nareshbhatia/mobx-state-router
 */

import { compile, PathFunction } from 'path-to-regexp';
import { stringify } from 'query-string';

const generatorCache = {};

const getGenerator = (pattern) => {
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
 * Converts the supplied routerState to a URL
 * @param {RouterStore} routerStore
 * @param {RouterState} routerState
 * @returns {string}
 */
export const routerStateToUrl = (routerStore, routerState) => {
    const { routeName, params, queryParams } = routerState;
    const route = routerStore.getRoute(routeName);
    return generateUrl(route.path, params, queryParams);
};
