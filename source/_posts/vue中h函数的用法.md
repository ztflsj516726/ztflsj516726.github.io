---
title: vue中h函数的用法
date: 2025-05-19 17:35:11
tags: 
- h函数
categories: 
- h函数
---



## h是创建虚拟dom的工具



- `h` 是 Vue 3 提供的**创建虚拟 DOM 节点（VNode）**的函数。
- 它的全称是“hyperscript”，用来“造”节点树，告诉 Vue 你想渲染什么结构。



## h函数的基本签名	

```js
h(type, props?, children?)
```

- **type**：节点类型，可以是字符串标签名（如 `'div'`），也可以是组件对象。
- **props**：属性和事件对象，比如 `{ class: 'box', onClick: fn }`。
- **children**：子节点，可以是字符串、VNode、数组等。



## 常见用法示例

1. **创建简单的元素节点**

   ```js
   h('div', 'Hello World')
   ```

   渲染成`<div>Hello World</div>`

2. **创建带属性的元素节点**

   ```js
   h('button', { onClick: () => alert('点击了') }, '点我')
   ```

   渲染成带点击事件的按钮`<div @click="()=>alert('点击了')">点我</div>`

3. **创建有多个子节点的元素**

   ```js
   h('ul', [
     h('li', '第一项'),
     h('li', '第二项'),
   ])
   ```

   渲染成一个有两个 `<li>` 的列表

4. **创建组件节点**

   ```js
   import MyComp from './MyComp.vue';
   
   h(MyComp, { propA: 123 })
   
   ```

5. **组合复杂节点**

   ```js
   h('div', { class: 'container' }, [
     h('h1', '标题'),
     h('p', '描述内容'),
     h('button', { onClick: () => alert('点我') }, '按钮'),
   ])
   ```



## 与render组合使用

- 选项式写法

```js
// MyWrapperComponent.js
import { h } from 'vue';
import MyComp from './MyComp.vue';

export default {
  name: 'MyWrapperComponent',
  render() {
    return h(MyComp, { propA: 123 });
  }
};

```

- setUp写法

```js
<script setup>
import { h } from 'vue';
import MyComp from './MyComp.vue';

defineRender(() => h(MyComp, { propA: 123 }));
</script>

```

一般来说h函数都是结合render使用的(vue3.4+可以使用defineRender)，render函数返回一个根节点，把自定义的h函数创建虚拟节点填充进去。

```js

<script setup>
import { h } from 'vue';
const div1 = h('div', { class: 'err-text' },[]);
const div2 = h('div', { class: 'err-text' },[]);
defineRender(() => h('div', {  },[
    div1,div2
]));
</script>
```

render函数的优先级高于模板，如果定义了render函数那vue编译的时候就不会使用模板了

## 总结

- `h` 是用来创建虚拟节点的工具函数
- 每次调用 `h` 都是造一个节点
- 它支持字符串标签、组件、属性、事件和子节点
- 通常和 `render` 函数一起用，写渲染逻辑
- 模板写法其实会被 Vue 转换成 `render` + `h` 这种形式

