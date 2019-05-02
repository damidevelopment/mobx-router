import React from 'react';
import { observer, inject } from 'mobx-react';

const MobxRouterBase = ({ routerStore, slot }) => {
    if (!slot) {
        console.error('Slot name for MobxRouter must be set!');
    }
    let viewRender = routerStore.currentView[slot];
    return typeof viewRender === 'function' ? viewRender() : null;
}

export const MobxRouter = inject('routerStore')(observer(MobxRouterBase));
