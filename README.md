# MobX Router for React

# Install

```
npm install damidev-mobx-router --save
```

# Usage

**config/views.jsx**
```
import React from 'react';
import { Route } from 'damidev-mobx-router';

export const views = {
    default: new Route({
        path: '/$',
        component: (<Homepage />)
    })
}
```
