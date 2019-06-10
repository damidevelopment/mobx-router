import React from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { RouterState } from '../router-store';
import { routerStateToUrl } from '../generate-url';
import { isObject } from '../utils';

class LinkBase extends React.Component
{
    constructor(props) {
        super(props);

        this.clickHandler = this.clickHandler.bind(this);

        if (!props.routerStore) {
            console.error('The routerStore prop must be defined for a Link component to work!');
        }
        this.linkRef = React.createRef();
    }

    setRouterState(props) {
        if (isObject(props.to)) {
            this.toState = new RouterState({ ...props.to });
        }
        else {
            this.toState = new RouterState({
                routeName: props.to,
                params: props.params,
                queryParams: props.queryParams,
            });
        }
    }

    clickHandler(e) {
        const { refresh = false, routerStore } = this.props;

        let { pathname, search, target } = this.linkRef.current;

        const middleClick = e.button === 2;
        const cmdOrCtrl = e.metaKey || e.ctrlKey;
        const openinNewTab = middleClick || cmdOrCtrl;
        const shouldNavigateManually = refresh || openinNewTab || cmdOrCtrl || target === '_blank';

        if (!shouldNavigateManually) {
            if (typeof this.props.onClick === 'function') {
                this.props.onClick(e);
            }

            if (!e.defaultPrevented) {
                e.preventDefault();
                routerStore.push({ pathname, search });
            }
        }
    }


    render() {
        this.setRouterState(this.props);

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

        if (activeClassName) {
            let index = href.indexOf('?');
            let routePath = href.substr(0, index < 0 ? href.length : index);

            if (routePath === routerStore.getCurrentPath()) {
                props.className = (props.className || '') + ' ' + activeClassName;
            }
        }

        return (<a ref={this.linkRef} {...props} href={href} onClick={this.clickHandler}>{children}</a>);
    }
}

export const Link = inject('routerStore')(observer(LinkBase));
