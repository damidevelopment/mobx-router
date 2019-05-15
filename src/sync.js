import { observe, toJS } from 'mobx';

export const syncHistoryWithStore = (history, store) => {
    // Initialise store
    store.history = history;

    // Handle update from history object
    const handleLocationChange = (location) => {
        store._updateLocation(location);
    };

    const unsubscribeFromHistory = history.listen(handleLocationChange);
    handleLocationChange(history.location);

    const subscribe = (listener) => {
        const onStoreChange = () => {
            const rawLocation = toJS(store.location);
            listener(rawLocation, history.action);
        };

        // Listen for changes to location state in store
        const unsubscribeFromStore = observe(store, 'location', onStoreChange);

        onStoreChange();

        return unsubscribeFromStore;
    };

    history.subscribe = subscribe;
    history.unsubscribe = unsubscribeFromHistory;

    return history;
}
