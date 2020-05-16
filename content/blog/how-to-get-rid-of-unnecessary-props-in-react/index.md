---
title: How to get rid of unnecessary props in React.js
date: "2020-05-16T22:40:32.169Z"
description: Using useContext and useReducer to cope with managing state
---
Many times when you write something in React, you have to face an eternal problem - passing props down, sometimes over the long components tree, just to cover one certain case. I think you are familiar with that, and... bad news for you - in most of these cases it means there is something wrong with an app architecture, but let's see how to solve it.

## Example
Let's look at the following example:
```js
import React, { useState } from "react";

const Todo = ({ text, onDelete }) => <div>
  <div>{text}</div>
  <button onClick={() => onDelete(text)}>X</button>
</div>;

const TodoStats = ({ items }) => {
  const totalCount = items.length;

  if (!totalCount) return null;

  return <div>Total items: {totalCount}</div>;
};

const TodoList = ({ items, onDelete }) => (
  <div>
    {items.map(item => (
      <Todo text={item} key={item} onDelete={onDelete} />
    ))}
  </div>
);


const TodoHeader = ({ items, onAddClick }) => {
  const [text, setText] = useState("");

  const handleTodoAdd = () => {
    onAddClick(text);
    setText("");
  };

  return (
    <div>
      <TodoStats items={items} />
      <input
        type="text"
        value={text}
        onChange={evt => setText(evt.target.value)}
      />
      <button onClick={handleTodoAdd}>ADD</button>
    </div>
  );
};

const TodoListApp = () => {
  const [todos, setTodos] = useState([]);

  const addTodo = todo => {
    setTodos([...todos, todo]);
  };

  const handleDelete = todo => {
    setTodos(todos.filter(t => t !== todo));
  };

  return (
    <div>
      <TodoHeader onAddClick={addTodo} items={todos} />
      <TodoList items={todos} onDelete={handleDelete} />
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <TodoListApp />
    </div>
  );
};

export default App;
```
That's the basic implementation of the todo list app. Let's think about it as some feature in the whole application that can have its own state, components, or even styles.

Now, what's wrong with this piece of code? Well... in some places, we don't use the props but we have to pass it just because of children's components need them. For instance:

- `TodoHeader` requires `items` only for `TodoStats `
- `TodoList` requires `onDelete` only for `Todo`

So what we can do with this? Share mandatory state and functions across the entire app/feature.

## Sharing state with the context API
If you need to share something between components, context API is really the best way to achieve it. So how our code was changed? Please look below:

```js
import React, { useState, useContext } from "react";

const TodoContext = React.createContext();

const Todo = ({ text, onDelete }) => <div>
  <div>{text}</div>
  <button onClick={() => onDelete(text)}>X</button>
</div>;

const TodoStats = () => {
  const context = useContext(TodoContext);
  const totalCount = context.todos.length;

  if (!totalCount) return null;

  return <div>Total items: {totalCount}</div>;
};

const TodoList = () => {
  const context = useContext(TodoContext);

  return (
    <div>
      {context.todos.map(item => (
        <Todo text={item} key={item} onDelete={context.handleDelete} />
      ))}
    </div>
  );
  }


const TodoHeader = () => {
  const context = useContext(TodoContext);
  const [text, setText] = useState("");

  const handleTodoAdd = () => {
    context.addTodo(text);
    setText("");
  };

  return (
    <div>
      <TodoStats />
      <input
        type="text"
        value={text}
        onChange={evt => setText(evt.target.value)}
      />
      <button onClick={handleTodoAdd}>ADD</button>
    </div>
  );
};

const TodoListApp = () => {
  const [todos, setTodos] = useState([]);

  const addTodo = todo => {
    setTodos([...todos, todo]);
  };

  const handleDelete = todo => {
    setTodos(todos.filter(t => t !== todo));
  };

  const contextValue = {
    todos,
    addTodo,
    handleDelete
  };

  return (
    <div>
      <TodoContext.Provider value={contextValue}>
        <TodoHeader />
        <TodoList />
      </TodoContext.Provider>
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <TodoListApp />
    </div>
  );
};

export default App;
```
Have you spotted a difference? Now, most of the components are independent - they don't have props as they read the state from a shared context. The only props they could have needed are UI-related ones rather than state-related.

But there is one more thing. In the component `TodoListApp` we have two responsibilities. The first one is displaying the data based on state, and the second one is state management (operations using `setState`). It's not that bad, however we are able to refactor it and achieve better code separation with one responsibility.

## State management with useReducer
Do you remember redux? It does one important thing - manages the state in the whole app, so the components can focus only on reading it and notice some changes by dispatching an action. Nowadays, using useReducer we can implement something like local-based redux, focussed only on our feature.  Let's introduce it:

```js
import React, { useState, useContext, useReducer } from "react";

const TodoContext = React.createContext();
const initialState = [];

const todoReeucer = (state, action) => {

  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.todo];
    case 'DELETE_TODO':
      return state.filter(t => t !== action.todo);
    default:
      return state;
  }
}

const Todo = ({ text, onDelete }) => <div>
  <div>{text}</div>
  <button onClick={() => onDelete(text)}>X</button>
</div>;

const TodoStats = () => {
  const context = useContext(TodoContext);
  const totalCount = context.todos.length;

  if (!totalCount) return null;

  return <div>Total items: {totalCount}</div>;
};

const TodoList = () => {
  const context = useContext(TodoContext);

  return (
    <div>
      {context.todos.map(item => (
        <Todo
          text={item}
          key={item}
          onDelete={todo => context.dispatch({ type: 'DELETE_TODO', todo })}
        />
      ))}
    </div>
  );
  }


const TodoHeader = () => {
  const context = useContext(TodoContext);
  const [text, setText] = useState("");

  const handleTodoAdd = () => {
    context.dispatch({ type: 'ADD_TODO', todo: text });
    setText("");
  };

  return (
    <div>
      <TodoStats />
      <input
        type="text"
        value={text}
        onChange={evt => setText(evt.target.value)}
      />
      <button onClick={handleTodoAdd}>ADD</button>
    </div>
  );
};

const TodoListApp = () => {
  const [todos, dispatch] = useReducer(todoReeucer, initialState);

  const contextValue = { todos, dispatch };

  return (
    <div>
      <TodoContext.Provider value={contextValue}>
        <TodoHeader />
        <TodoList />
      </TodoContext.Provider>
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <TodoListApp />
    </div>
  );
};

export default App;
```
What we did actually? We separated the state management layer from the UI layer. It may look like more code, but please think about it in the context of testing or logic separation. Using this approach, you are able to test state-related logic independently from components, while in the previous version of `TodoListApp` you had to do it simultaneously (test adding and removing todos along with rendering stuff).

## When to use useContext and useReducer?
It depends. Everything is always related to the feature you want to implement. If you want to share something across the code - contexts are the best choice, but if your code is really easy, passing one prop down would be more reasonable. What about reducers? If your state is really complicated it's nice to separate it - that will be easier to maintain in the future as you can see exactly what is the state-flow, otherwise when your app has just one or two fields to obtain, keep that in the component.

Thanks for reading!
