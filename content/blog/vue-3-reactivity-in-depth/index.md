---
title: Vue 3 reactivity in depth
date: "2020-04-28T23:46:37.121Z"
---

As Vue 3 is introducing composition API and its own reactivity system, I was curious how it works underneath. I spent some time researching it and analyzing its implementation and I think I understood how it works. Of course today there are tons of explanations, but I decided to go over this on my own, and here I'm sharing what I found.

_In this article I used simple arrays and objects instead of `Map` or `Set` just for simplicity and for paying more attention to the topic rather than javascript API_

## What is new in Vue 3?
Let's consider the following piece of code using plain javascript:

```js
const person = { firstName: "John", lastName: "Doe" };
const fullName = `${person.firstName} ${person.lastName}`;
person.firstName = "David";

console.log(`You are logged as: ${fullName}`); // You are logged as: John Doe
```
Obviously, you can see `John Doe` in the console even though you have changed the `firstName` to `David` - it's because that evaluation is imperative which means the execution goes line by line. Firstly you create a `person` object, secondly `fullName` and assigning new `firstName` at the end.

Now please look at the similar code using Vue 3 reactivity system:
```js
const person = reactive({ firstName: "John", lastName: "Doe" });  // reactive field
const fullName = computed(() => `${person.firstName} ${person.lastName}`); // effect
person.firstName = "David";

console.log(`You are logged as: ${fullName}`); // You are logged as: David Doe
```

We can notice a different result. In our console `David Doe` has been displayed. What sort of magic really happened there? Well... we defined a reactive property using `reactive` function, secondly, with `computed` we created an effect that will combine two fields of `person` object: `firstName` and `lastName` into one string. Whenever used properties change, the effect will be fired, hence `fullName` receives a new value.

What's inside of `reactive` function that adds such super abilities to the object? There is a sort of tracking system that reacts to the changes by calling linked effects. Whenever you access some property (eg. `person.firstName` call), it begins to be tracked and if you modify it (`person.firstName = "David"`) - the assigned effect (`computed`) is being triggered. That's the basic idea. Let's try to implement it then!

## Detecting access to the object
First of all, we need to somehow detect what properties we access in the object. To do this we can use `Proxy`:

```js
const reactive = obj =>
  new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      console.log("get", key);
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      console.log("set", key);
      return res;
    }
  });

const person = reactive({ firstName: "John", lastName: "Doe" });
person.firstName = "David"; // displays 'set firstName David'
console.log(person.firstName); // displays 'get firstName David' and 'David'
```

The first argument of a `Proxy` constructor is an object that we want to use and the second one is a handler, that gives as a possibility to react whenever we change a property (`set` method) of an object or we access it (`get` method).


## Traceability of fields and the effect
Here the all fun comes. We know how to inject into the setting and getting process, but how to use that? Let's think about it for a while. Based on my previous explanation we can think of two facts:
- each time you set a property it causes an effect (`callEffects()`)
- each time you access the property you should save its effects (`track()`) and trigger it in the future


```js
const reactive = obj =>
  new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      track();
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      callEffects();
      return res;
    }
  });
```
Ok let's focus on `track` and `callEffects`. I mentioned that `track` should save effects and `callEffects` triggers them all once some property in the object was set.

```js
const effects = []; // effects collection

const track = () => {
  effects.push(effect); // we save effect for latter
};

const callEffects = () => {
  effects.forEach(effect => effect()); // change detected, fire all related effects
};
```
And of course we have to define our effect:

```js
let fullName = "";

const effect = () => {
  fullName = `${person.firstName} ${person.lastName}`;
};

effect();
```

Full code:

```js
const effects = [];

const track = () => {
  effects.push(effect);
};

const callEffects = () => {
  effects.forEach(effect => effect());
};

const reactive = obj =>
  new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      track();
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      callEffects();
      return res;
    }
  });

const person = reactive({ firstName: "John", lastName: "Doe" });
let fullName = "";

const effect = () => {
  fullName = `${person.firstName} ${person.lastName}`;
};

effect();

console.log(`You are logged as: ${fullName}`); // You are logged as: John Doe
person.firstName = "David";
console.log(`You are logged as: ${fullName}`); // You are logged as: David Doe
```
As you can see, the result is more similar to the Vue-based one, but keep reading, there is more work to do!

## Introduce current effect
Our basic reactivity works pretty well. But we have to call our effect manually in the beginning and also `track` function adds that effect multiple times. Let's improve!

I defined `currentEffect` to store the current effect that should be added to the collection, but only when it's assigned, otherwise, there is no sense to call `effects.push` - that would add the same effect again. Furthermore, there is `effect` function that assigns given effect as a current one, and fires effect immediately (that was our initial call we had to call manually, remember?).

```js
let currentEffect = null;

const effects = [];

const track = () => {
  if (!currentEffect) return;
  effects.push(currentEffect);
};

const callEffects = () => {
  effects.forEach(effect => effect());
};

const effect = fn => {
  currentEffect = fn;
  currentEffect();
  currentEffect = null;
};

// ...

let fullName = "";

effect(() => {
  fullName = `${person.firstName} ${person.lastName}`;
});

console.log(`You are logged as: ${fullName}`); //  You are logged as: John Doe
person.firstName = "David";
console.log(`You are logged as: ${fullName}`); // You are logged as: David Doe
```

## Property dependencies
We are able to track properties but we have no clue which ones. As a result of that, our `track` function will store effects for every single property access, although the effect depends only on certain ones.

```js
let fullName = "";
let welcome = "";

effect(() => {
  fullName = `${person.firstName} ${person.lastName}`; // dependencies: firstName and lastName
});

effect(() => {
  welcome = `Mr. ${person.lastName}`; // this depends only on lastName!
});
```
How to solve that? Use a map of effects where the keys are tracked field names and values are related effects.

```js
let currentEffect = null;
const deps = {}; // map of properties and their effects
const track = key => {
  if (!currentEffect) return

  if (!deps[key]) { // if property doesn't have collection, create it
    deps[key] = [];
  }

  deps[key].push(currentEffect); // add effect
};

const callEffects = key => {
  if (!deps[key]) return;

  deps[key].forEach(effect => effect());
};

// ...
```

## Close object reactivity
Unfortunately, there is still a problem that needs to be solved. What if we define two reactive variables? Look at example below:

```js
const person1 = reactive({ firstName: "John", lastName: "Doe" });
const person2 = reactive({ firstName: "David", lastName: "Doe" });

let fullName1 = "";
let fullName2 = "";

effect(() => {
  console.log("trigger 1");
  fullName1 = `${person1.firstName} ${person1.lastName}`;
});

effect(() => {
  console.log("trigger 2");
  fullName2 = `${person2.firstName} ${person2.lastName}`;
});

person1.firstName = "David"; // 'trigger 1' and 'trigger 2' in the console!
```

I changed the `firstName` for `person1` but both effects were triggered! It's not an expected result, we suppose to call effects that are related to its object, let's do it.

Actually we need to do something very similar to the previous step but for the target object. We've been storing a map of properties and their effects, now we have to go a level below and start storing a target object, its properties, and all related effects in each property.

```js
// ...
const deps = new WeakMap();
const track = (target, key) => {
  if (!currentEffect) return;

  let objMap = deps.get(target);

  if (!objMap) { // if there is no such a target, create it
    objMap = {}; // define map of properties and their effect collections
    deps.set(target, objMap); // set it
  }

  let dep = objMap[key];

  if (!dep) { // if there is no given property in that target, create it
    dep = []; // create effects collection
    objMap[key] = dep; // set it
  }

  dep.push(currentEffect); // add effect
};

const callEffects = (target, key) => {
  let objMap = deps.get(target);

  if (!objMap) return;

  const dep = objMap[key];

  if (!dep) return;

  dep.forEach(effect => effect());
};

//...
```
_I used here a `WeekMap` which gives a possibility to store something under the given object as a key._

That's it! We achieved quite similar implementation to the one prepared by Vue team. Original Vue source code references:
- [setting target's map of the properties](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts#L145)
- [setting map of effects](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts#L149)
- [add active effect](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts#L152)
- [run effects](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts#L251)
- [effect function](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts#L54)

## Summary
The original implementation is undoubtedly more complicated and we haven't covered other features and edge cases, but I wanted to show only the general idea behind it.


Thanks for reading!
