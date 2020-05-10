---
title: How to create your own Redux
date: "2018-09-23T22:12:03.284Z"
description: "Are you a beginner in the react world? Or you want to go deeper and see how it works? — this post is for you! Let’s try to wire our own redux implementation."
---

Undoubtedly, everyone who has ever worked with react-based apps has heard about Redux. If you wanted to write a more complicated app, you would probably need to use a state management, such as Redux. It is the most popular solution for this, but there are alternatives, like MobX or just clean Context API, which was released recently — some developers claim that they would use this instead…

## The implementation from scratch

**Let’s consider the following app:**

<iframe
     src="https://codesandbox.io/embed/6n0n923z6k?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="01-redux-example"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

This is a just clean example of redux-based application. There is only one simple component that is connected to the redux cycle (Counter). We have two buttons inside: increment and decrement. As you probably already guessed — these buttons will either increase or decrease the counter value.

**Our goal is to create the redux from scratch.** So we have to replace lines marked with the numbers 1 — **createStore()**, 2 — **combineReducers()**, 3 — Provider and 4 — **connect()** with our implementations of these ones.

###  createStore()
A **store** in Redux is responsible for a few things. First of all, it contains our current state of the application and it gives us the possibility to “change” it, by generating a new state, that comes from calling a _reducer_. This _reducer_ will only be called when we trigger an action. In Redux, the method by which this is done is _dispatch()_.
When this action has been triggered, who will know about it? When this happens, we need listeners. The listeners will wait for actions and as soon as it arises, all of the registered listeners will know when this is happening. In order to register a new listener in Redux, we have to call _subscribe()_.
When we made some changes in the store — I mean, a new state was generated, it would be nice to read it — this is the place where _getState()_ comes.
Take a look at the following implementation:

```js
import React from "react";

const createStore = rootReducer => {
  let state;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = rootReducer(state, action);
    listeners.forEach(listener => listener(state));
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  dispatch({});

  return { getState, dispatch, subscribe };
};

export { createStore };
```

### combineReducers()
The _createStore()_ function allow us to pass only one reducer function. In a more complicated application, you would probably want to have the possibility to build more complex structures of reducers and split them into separate functions where each of them can manage different and independent parts of the state. That’s why we need a _combineReducers()_. By this function, we are able to turn the object whose values are the reducer functions into one single function that can be used with _createStore()_.

_combineReducers()_ just calls every single reducer, and save the produced values into one, nested object. These values will be saved under the keys that you passed to this function.

```js
import React from "react";

const combineReducers = reducers => {
  const nextState = {};
  const reducerFunctions = {};
  const reducersKeys = Object.keys(reducers);
  reducersKeys.forEach(reducerKey => {
    if (typeof reducers[reducerKey] === "function") {
      reducerFunctions[reducerKey] = reducers[reducerKey];
    }
  });
  const reducerFunctionsKeys = Object.keys(reducerFunctions);

  return (state = {}, action) => {
    reducerFunctionsKeys.forEach(reducerKey => {
      const reducer = reducerFunctions[reducerKey];
      nextState[reducerKey] = reducer(state[reducerKey], action);
    });

    return nextState;
  };
};

const createStore = rootReducer => {
  let state;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = rootReducer(state, action);
    listeners.forEach(listener => listener(state));
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  dispatch({});

  return { getState, dispatch, subscribe };
};

export { createStore, combineReducers };
```

### Provider
Redux uses special component for sharing state across application. This component is called _Provider_ and in order to implement it we can use the new **context API**. So the Provider becomes really simple. The only thing that we need to do is using that API and pass the _store_ down:

```js
import React from "react";

const ReduxContext = React.createContext("redux");

const Provider = ({ store, children }) => (
  <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
);

const combineReducers = reducers => {
  const nextState = {};
  const reducerFunctions = {};
  const reducersKeys = Object.keys(reducers);
  reducersKeys.forEach(reducerKey => {
    if (typeof reducers[reducerKey] === "function") {
      reducerFunctions[reducerKey] = reducers[reducerKey];
    }
  });
  const reducerFunctionsKeys = Object.keys(reducerFunctions);

  return (state = {}, action) => {
    reducerFunctionsKeys.forEach(reducerKey => {
      const reducer = reducerFunctions[reducerKey];
      nextState[reducerKey] = reducer(state[reducerKey], action);
    });

    return nextState;
  };
};

const createStore = rootReducer => {
  let state;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = rootReducer(state, action);
    listeners.forEach(listener => listener(state));
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  dispatch({});

  return { getState, dispatch, subscribe };
};

export { createStore, combineReducers, Provider };
```

### connect()
This part of Redux allows us to add some components to the redux cycle. This is a **HOC**, that is wrapping our component and passing some new props which come from redux cycle. These new props are determined by two functions: _mapStateToProps and mapDispatchToProps_.

As you remember, we have a shared state of our application by _Provider_ and _context API_. Now it’s time to use that API again to read these available values. Here we use _mapStateToProps_. With this function, we can read everything we need from the store by context API, and pass it down to the component as his props.

The very similar situation is the one we have with _mapDispatchToProps_, but instead of values from the state, we are going to pass some actions down, which will allow for our wrapped component to trigger them.

```js
import React from "react";

const connect = (mapStateToProps, mapDispatchToProps) => Component => {
  class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.state = props.store.getState();
    }

    componentDidMount() {
      this.props.store.subscribe(state => {
        this.setState(state);
      });
    }

    render() {
      const { store } = this.props;

      return (
        <Component
          {...this.props}
          {...mapStateToProps(store.getState())}
          {...mapDispatchToProps(store.dispatch)}
        />
      );
    }
  }

  return props => (
    <ReduxContext.Consumer>
      {store => <Connect {...props} store={store} />}
    </ReduxContext.Consumer>
  );
};

const ReduxContext = React.createContext("redux");

const Provider = ({ store, children }) => (
  <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
);

const combineReducers = reducers => {
  const nextState = {};
  const reducerFunctions = {};
  const reducersKeys = Object.keys(reducers);
  reducersKeys.forEach(reducerKey => {
    if (typeof reducers[reducerKey] === "function") {
      reducerFunctions[reducerKey] = reducers[reducerKey];
    }
  });
  const reducerFunctionsKeys = Object.keys(reducerFunctions);

  return (state = {}, action) => {
    reducerFunctionsKeys.forEach(reducerKey => {
      const reducer = reducerFunctions[reducerKey];
      nextState[reducerKey] = reducer(state[reducerKey], action);
    });

    return nextState;
  };
};

const createStore = rootReducer => {
  let state;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = rootReducer(state, action);
    listeners.forEach(listener => listener(state));
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  dispatch({});

  return { getState, dispatch, subscribe };
};

export { createStore, combineReducers, connect, Provider };
```

Everything what we needed has been implemented. Now when we use our code instead of Redux, everything should works. Look at the **demo* below:

<iframe
     src="https://codesandbox.io/embed/wkj6pnwj68?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="01-redux-my-redux"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

Of course, the above implementation is a bit naive and, for sure, not production ready! There are many things that weren’t created, like middlewares, asynchronous calls or some edge cases. The main goal of this post was only showing how it’s done and I hope now Redux is becoming more clear and simpler.

Cheers!🎉

