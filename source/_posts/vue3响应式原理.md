---
title: vue3响应式原理
date: 2025-05-21 15:30:34
tags:
- vue3
categories: 
- vue3 
---

### Vue 3 响应式原理概览

> [!IMPORTANT]
>
> ​	**Vue 3 的响应式系统基于 Proxy，它通过拦截对象的 `get` 和 `set` 操作，来使得数据变化时能自动更新视图。相比于 Vue 2，Vue 3 的响应式系统性能更高，支持的场景更丰富，同时代码也更加简洁。**



1. **Proxy基本原理**

   `Proxy` 是 ES6 引入的一个新特性，它允许你创建一个代理对象，对目标对象的所有操作（如访问属性、修改属性等）进行拦截。

   在 Vue 3 中，`Proxy` 通过 `get` 和 `set` 拦截器来实现响应式。

   - `get(target, key)`：当你访问一个对象的属性时，`get` 会被触发。
   - `set(target, key, value)`：当你修改对象的属性时，`set` 会被触发。

   通过这两个方法，Vue 可以对对象的操作进行监听，从而实现数据的响应式管理。

2. **依赖收集与视图更新**

   - **依赖收集**：当组件或计算属性访问某个响应式数据时，Vue 会记录这个依赖关系。具体来说，Vue 会把当前组件（或计算属性）加入到某个属性的依赖列表中。
   - **视图更新**：当某个属性发生变化时，Vue 会通知所有依赖该属性的组件或计算属性重新渲染。****

   Vue 3 使用 `Proxy` 实现依赖收集，在 `get` 方法中通过记录当前的 "执行上下文"（即哪个组件或计算属性正在访问该属性）来收集依赖。在 `set` 方法中，通过通知依赖列表的所有项来进行更新。

   ------

   

### Vue 3 响应式实现步骤

1. **创建代理对象**

   首先，Vue 3 使用 `Proxy` 来代理对象。当你访问或修改对象的属性时，代理对象会触发相应的 `get` 和 `set` 方法。Vue 会在这些方法中加入额外的逻辑来管理响应式。

   例子：创建一个响应式对象

   ```js
   const state = {
     message: 'Hello Vue 3',
     count: 0
   }
   
   const proxyState = new Proxy(state, {
     // get 拦截器
     get(target, key) {
       console.log(`访问了 ${key} 属性`)
       return target[key]
     },
   
     // set 拦截器
     set(target, key, value) {
       console.log(`设置了 ${key} 属性为 ${value}`)
       target[key] = value
       return true
     }
   })
   
   console.log(proxyState.message)  // 访问了 message 属性
   proxyState.count = 1            // 设置了 count 属性为 1
   
   ```

   `Proxy` 会拦截所有对 `proxyState` 的操作，`get` 会在访问属性时触发，`set` 会在修改属性时触发。

2. **依赖收集**

   当你访问某个属性时，Vue 3 会收集这个访问操作的依赖关系。也就是说，Vue 记录下当前访问该属性的组件或计算属性，以便将来该属性变化时通知它们重新渲染。

   **依赖收集的实现：**

   当你访问 `proxyState.message` 时，Vue 会自动将当前的“执行上下文”（即正在执行的组件或计算属性）加入到该属性的依赖列表中。

   - **依赖收集**：每次访问 `proxyState` 上的某个属性时，Vue 会记下当前组件或计算属性作为依赖。
   - **依赖列表**：Vue 会为每个响应式数据维护一个依赖列表，当数据变化时，依赖列表会收到通知，进行相应的视图更新。

3. **修改数据并触发更新**

   当你修改对象的属性时，`set` 拦截器会被触发。在 `set` 方法中，Vue 会执行以下操作：

   - 修改对象的属性值。

   - 通知依赖该属性的组件或计算属性，**触发更新**。

   Vue 会通过 **reactivity system**（响应式系统）确保每个组件只会重新渲染一次，并且仅在它依赖的数据发生变化时才更新。

   代码示例：触发视图更新

   ```js
   const state = {
     count: 0
   }
   
   const proxyState = new Proxy(state, {
     get(target, key) {
       console.log(`访问了 ${key} 属性`)
       // 收集依赖（在 Vue 3 中会有更复杂的依赖收集机制）
       return target[key]
     },
   
     set(target, key, value) {
       console.log(`设置了 ${key} 属性为 ${value}`)
       target[key] = value
       // 触发更新（在 Vue 3 中会通过依赖列表来触发相关的视图更新）
       return true
     }
   })
   
   // 访问属性，触发依赖收集
   console.log(proxyState.count)  // 访问了 count 属性
   
   // 修改属性，触发视图更新
   proxyState.count = 1           // 设置了 count 属性为 1
   
   ```

   当修改 `proxyState.count` 时，Vue 会通过依赖收集机制，通知依赖该数据的所有组件重新渲染。

   ------

   

### Vue 3 的响应式特性

1. **嵌套对象的响应式**

   Vue 3 支持**深度嵌套对象的响应式**。当你访问或修改嵌套对象的属性时，Vue 3 会递归地为每个嵌套对象创建新的 `Proxy`，从而确保每个属性都具有响应式。

   ```js
   const state = {
     user: {
       name: 'John',
       age: 30
     }
   }
   
   const proxyState = new Proxy(state, {
     get(target, key) {
       console.log(`访问了 ${key} 属性`)
       const value = target[key]
       
       if (typeof value === 'object') {
         // 递归创建嵌套对象的 Proxy
         return new Proxy(value, this)
       }
       
       return value
     },
   
     set(target, key, value) {
       console.log(`设置了 ${key} 属性为 ${value}`)
       target[key] = value
       return true
     }
   })
   
   console.log(proxyState.user.name)  // 访问了 user 属性 -> 访问了 name 属性
   proxyState.user.name = 'Jane'      // 设置了 user.name 属性为 Jane
   
   ```

   

2. **响应式数组**

   Vue 3 的响应式系统通过 `Proxy` 能够**自动处理数组**，包括数组的 `push`、`pop`、`splice` 等操作，避免了 Vue 2 中需要重写数组方法的问题。

   ```js
   const arr = [1, 2, 3]
   
   const proxyArr = new Proxy(arr, {
     get(target, key) {
       console.log(`访问了 ${key} 索引`)
       return target[key]
     },
   
     set(target, key, value) {
       console.log(`设置了 ${key} 索引为 ${value}`)
       target[key] = value
       return true
     }
   })
   
   proxyArr[0] = 10  // 设置了 0 索引为 10
   console.log(proxyArr[0])  // 访问了 0 索引
   
   ```

3. **性能和懒代理**

   Vue 3 的响应式系统是**懒代理**的。只有当你访问某个属性时，Vue 才会创建相应的 `Proxy`，这减少了不必要的开销，并提高了性能。

   ------

   

### 总结

Vue 3 的响应式原理利用了 **Proxy** 的强大特性：

- **代理整个对象**：通过 `Proxy` 一次性代理整个对象，避免了 `Object.defineProperty` 需要为每个属性单独定义 `getter` 和 `setter` 的繁琐。
- **依赖收集与视图更新**：每当你访问某个属性时，Vue 会将当前访问的上下文（组件或计算属性）记录为该属性的依赖，数据变化时会自动触发依赖更新。
- **支持嵌套对象和数组**：`Proxy` 可以递归地为嵌套对象和数组创建代理，确保嵌套层级的每个属性都有响应式效果。
- **懒代理**：Vue 3 是懒代理的，只有在访问数据时才会创建 `Proxy`，节省了性能开销。
