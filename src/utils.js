const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);

export const getObjectKeys = obj => (isObject(obj) ? Object.keys(obj) : []);

export const noopAsync = (...args) => {
    const next = args.pop();
    next();
};

export const buildFnsArray = (...args) => {
    const arr = [];
    return arr.concat.apply(arr, args).filter(fn => typeof fn === 'function');
}

const setCurrentRoute = (routerStore, view) =>
    (...args) => {
        const next = args.pop();
        routerStore.currentRoute = view;
        next();
    };

export const dummyFn = (logMessage) =>
    (...args) => {
        const next = args.pop();
        console.log(logMessage, args);
        next();
    };

export const viewsForDirector = (views, routerStore) =>
    getObjectKeys(views).reduce((obj, viewKey) => {
        const view = views[viewKey];

        obj[view.path] = {
            ...viewsForDirector(view.subroutes, routerStore),
            on: buildFnsArray(
                view.beforeEnter,
                setCurrentRoute(routerStore, view),
                routerStore.onMatch
            )
        };

        return obj;
    }, {});
