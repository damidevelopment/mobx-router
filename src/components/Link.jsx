import React from 'react';
import { observer, inject } from 'mobx-react';
import { RouterState } from '../router-store';
import { routerStateToUrl } from '../generate-url';
import { getPath } from '../utils';

class LinkBase extends React.Component
{
    constructor(props) {
        super(props);

        this.clickHandler = this.clickHandler.bind(this);

        if (!props.routerStore) {
            console.error('The routerStore prop must be defined for a Link component to work!');
        }

        this.toState = new RouterState({
            routeName: props.to,
            params: props.params,
            queryParams: props.queryParams,
        });
    }

    clickHandler(e) {
        const {
            refresh = false,
            routerStore
        } = this.props;

        const middleClick = e.button === 2;
        const cmdOrCtrl = e.metaKey || e.ctrlKey;
        const openinNewTab = middleClick || cmdOrCtrl;
        const shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl;

        if (!shouldNavigateManually) {
            e.preventDefault();
            routerStore.goTo(this.toState);
        }
    }

    render() {
        const {
            params,
            queryParams,
            refresh,
            children,
            routerStore,
            activeClassName,
            ...props
        } = this.props;

        if (!routerStore) {
            return null;
        }

        let href = routerStateToUrl(routerStore, this.toState);

        if (activeClassName && href === getPath()) {
            props.className = (props.className || '') + ' ' + activeClassName;
        }

        return (<a {...props} href={href} onClick={this.clickHandler}>{children}</a>);
    }
}

export const Link = inject('routerStore')(observer(LinkBase));
