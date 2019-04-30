import React from 'react';
import { observer, inject } from 'mobx-react';

const MobxRouterBase = ({ routerStore, slot }) => {
    if (!slot) {
        console.error('Slot name for MobxRouter must be set!');
    }
    let component = routerStore.currentView[slot];
    console.log('MobxRouter.render', typeof component);
    return (typeof component === 'function' ? component() : component) || null;
}

export const MobxRouter = inject('routerStore')(observer(MobxRouterBase));
