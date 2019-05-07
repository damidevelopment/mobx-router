# MobX Router

MobX-powered router for React apps.

## Getting Started

Install via npm

```
npm install damidev-mobx-router
```

Then create all routes you need, like this:

```js
import { Route } from 'damidev-mobx-router';

const views = {
    default: new Route({
        path: '/',
        component: (<Homepage />)
    }),
}
```

You can also use nested routes for layouting your contents.

```js
import { Route } from 'damidev-mobx-router';

const views = {
    home: new Route({
        path: '/',
        component: (<Layout />),

        subroutes: {
            page: new Route({
                path: '/',
                component: (<Homepage />)
            }),

            next: new Route({
                path: '/about',
                component: (<About />)
            })
        }
    })
}
```

When you need to work params or stores, just define `component` as a function.

```js
import { Route } from 'damidev-mobx-router';

const views = {
    profile: new Route({
        path: '/profile/:id',
        // first argument is route props, it's mix of route params and queryString params
        // second argument is rootStore reference, see startRouter bellow
        component: ({ id }, { userStore }) => {
            return (<Profile user={userStore.getProfile(id)} />);
        }
    })
}
```

You can control routes with beforeEnter events. property beforeEnter accepts function or array of functions, each function gets same argunent as prop `component`. Event beforeEnter can return Promise, ObservableFromPromise (@see mobx-utils fromPromise) or nothing.

When beforeEnter callback returns Promise or ObservableFromPromise object, route waits until Promise is finished, then steps to next beforeEnter or continues to component. You can deny route access when returned Promise is rejected.

```js
import { Route } from 'damidev-mobx-router';

const views = {
    default: new Route({
        path: '/',
        component: (params, { dataStore }) => (<Homepage data={dataStore.getData()} />),
        beforeEnter: [
            // wait until data are fetched from server
            (params, { dataStore }) => {
                return fetch('/api/data.json')
                    .then((response) => dataStore.setData(response.data));
            },

            // or use mobx-utils fromPromise function
            (params) => {
                const promise = fetch('/api/data.json');
                return fromPromise(promise);
            },

            // allow only logged user to acces
            (params, { userStore }) => {
                return userStore.isLogged || Promise.reject();
            }
        ]
    }),
}
```

When you finish with routes configuration you need to start mobx router.

```js
import { startRouter } from 'damidev-mobx-router';

const rootStore = {
    // define other stores here
};

startRouter(views, rootStore, options);
```

Now app is listening to url changes. Next you need to provide `RouterStore` instance to your app and define default slot for rendering your routes.

```js
import { MobxRouter } from 'damidev-mobx-router';

class App extends React.Component {
    render() {
        return (
            <Provider routeStore={rootStore.routeStore}>
                <MobxRouter slot="default" />
            </Provider>
        );
    }
}
```

## Use multiple slots

When you want to use multiple slots, just configure router like this:


```js
const options = {
    currentView: {
        default: null,
        content: null,
    }
};

const views = {
    home: new Route({
        path: '/',
        component: (<Layout><MobxRouter slot="content" /></Layout>),

        subroutes: {
            page: new Route({
                slot: 'content',
                path: '/',
                component: (<Homepage />)
            }),

            next: new Route({
                slot: 'content',
                path: '/about',
                component: (<About />)
            })
        }
    })
};

startRouter(views, rootStore, options);

class App extends React.Component {
    render() {
        return (
            <Provider routeStore={rootStore.routeStore}>
                <MobxRouter slot="default" />
            </Provider>
        );
    }
}
```

## How to use links?

Here are all custom props for Link component. Prop `to` needs to mach route name as defined in `views`. Nested route names are merged with dot.

```js
import { Link } from 'damidev-mobx-router';

<Link to="home.page" params={{foo: 'bar'}} queryParams={{page: 1}} activeClassName="active">Link to Homepage component</Link>
```
