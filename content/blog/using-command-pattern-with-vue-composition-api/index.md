---
title: Using command pattern with vue composition-API
date: "2020-08-05T23:46:37.121Z"
---

"Design patterns" is one of the topics that everyone has heard about, but usually, no one uses it. Sometimes it's just better to take a step back and think twice about the problems we come across in our software development adventure - it's likely that someone faced it before we dit, and solved it before we did.

I've been considering a command pattern recently and it's a certainly powerful concept. It let you encapsulate the action logic and all corresponding information to perform or undo it.

The overall idea is to implement actions as separate objects (commands) that can be invoked by a sort of manager (invoker).

Imagine a cart object. The cart has functions to operate on it, such as _addToCart_, _removeFromCart_, _applyDiscunt_, _cleanCart_, and so on. Each time you want to add a new operation, you have to modify the original object of the cart (adding a new function).

Using a command pattern the cart object becomes an invoker and it has only one function that triggers given commands. When you want to add a new operation, create a new command, you don't have to touch the cart at all.

Let's jump to the Vue world and try to define cart as a composition API - *useCart*

## Using command pattern

The essential unit of this approach is a `command`. It must implement two functions, the first one to invoke action and the second one to undo it. We can define this as a pure function that just returns the mentioned requirements:


```js
const AddToCart = product => ({
  invoke: cart => ({
    ...cart,
    products: [...cart.products, product],
    totalPrice: cart.totalPrice + product.price
  }),
  undo: cart => ({
    ...cart,
    products: cart.products.filter(p => p.id != product.id),
    totalPrice: cart.totalPrice - product.price
  })
});
```

As the argument of this action, we take a product that we want to add to a cart. Secondly, we are returning the following functions:
- `invoke` - which performs some action on the given state and returns the new one. In this case, it just adds a product to the cart and updates the total price.
- `undo` - which allows us to move backward, it is undoing an action that we executed.

Once we have defined our first command, let's move to the invoker. Apparently, our invoker is `useCart` function and its implementation may look like this:

```js
const useCart = () => {
  const history = [];
  const cart = ref({
    products: [],
    discount: null,
    totalPrice: 0
  });

  const invoke = command => {
    cart.value = command.invoke(cart.value);
    history.push(command);
  };

  const undo = () => {
    cart.value = history.pop().undo(cart.value);
  };

  return { invoke, undo, cart };
};
```

Considering that example, `useCart` has to implement just two functions (to modify the state) even if we have many operations related to the cart.

```js
const { invoke, undo, cart } = useCart();

invoke(AddToCart({ id: 1, name: "Beer", price: 4 }));
// Beer in cart, total price is 4

invoke(AddToCart({ id: 2, name: "Pizza", price: 10 }));
// Beer and Pizza in cart, total price is 14

undo();
// Beer in cart, total price is 4
```

That leads to the following conclusion:
- `useCart` keeps only the state and share it along with `invoke` and `undo` functions
- implementing a new feature comes with creating a new command, nothing else (we don't have to update `useCart` itself)
- it's super testable - each command has dedicated unit test, arguments are easy to mock
- we can track the history of changes and we can move backward

## Summary

It might look amazing for first sight how simple we can implement new functionality in the system, but it raises a question whether should we use that everywhere? - of course not, it totally depends on the problem, so when should we use it then?

The command pattern is pretty useful when it's likely that part of the system will be extended in the future or we want to leave the ability to implement any action for the developer. Additionally, because of having a history - we can use that pattern if there is a need to undo some actions (eg. text editors).

However, if a given feature is pretty simple, it has a fixed set of actions/operations, using a command pattern could be overhead.

