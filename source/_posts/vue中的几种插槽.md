---
title: vue中的几种插槽
date: 2025-07-23 15:12:53
tags: 
- 插槽
- vue
categories: 
- vue
---

## 1. 默认插槽（Default Slot）

最简单、最常用的插槽，父组件放到子组件标签中间的内容都会被插入到子组件的 `<slot>` 标签所在位置。

```vue
<!-- 子组件 MyComponent.vue -->
<template>
  <div>
    <slot>默认内容</slot>
  </div>
</template>

<!-- 父组件 -->
<MyComponent>
  <p>这里是插槽内容</p>
</MyComponent>

```

如果父组件没有传内容，插槽会显示“默认内容”。

## 2. 具名插槽（Named Slot）

给 `<slot>` 加个 `name`，父组件通过对应的 `slot` 属性指定内容插入到对应位置。适合多个插槽。`v-slot:header`可以简写成`#header`。 

```vue
<!-- 子组件 -->
<template>
  <div>
    <header><slot name="header">默认头部</slot></header>
    <main><slot>默认主体</slot></main>
    <footer><slot name="footer">默认底部</slot></footer>
  </div>
</template>

<!-- 父组件 -->
<MyComponent>
  <template v-slot:header>    
    <h1>这里是头部内容</h1> 
  </template>

  <p>这里是默认主体内容</p>

  <template v-slot:footer>
    <small>这里是底部内容</small>
  </template>
</MyComponent>

```

## 3. 作用域插槽（Scoped Slot）

子组件向插槽传递数据，父组件通过插槽模板来接收并使用数据。适合数据驱动内容显示。

> [!NOTE]
>
> - 作用域插槽只有一个的情况下 `v-slot="{ user }"`可以简写成 `#default="{user}"`
> - 



```vue
<!-- 子组件 -->
<template>
  <div>
    <slot :user="user"></slot>
  </div>
</template>
<script>
export default {
  data() {
    return {
      user: { name: '小明', age: 18 }
    }
  }
}
</script>

<!-- 父组件 -->
<MyComponent v-slot="{ user }">
  <p>用户名：{{ user.name }}, 年龄：{{ user.age }}</p>
</MyComponent>

```

## 4. 作用域具名插槽

结合具名插槽和作用域插槽，给具名插槽传数据。

> [!NOTE]
>
> - 作用域具名插槽，有多个插槽的简写
> - `v-slot:header`简写成`#header`  `v-slot:end`简写成`#end`



```
<!-- 子组件 -->
<slot name="header" :title="title"></slot>
<slot name="footer" :end="end"></slot>

<!-- 父组件 -->
<template #header="{ title }">
  <h1>{{ title }}</h1>
</template>
<template #footer="{ end }">
  <h1>{{ end }}</h1>
</template>

```

## 5. 动态插槽名（动态具名插槽）

通过绑定动态名字实现动态选择插槽。

```vue
<slot :name="dynamicSlotName"></slot>
```

## 总结

|  插槽类型   |           用途           |              写法示例               |
| :---------: | :----------------------: | :---------------------------------: |
|  默认插槽   |       插入默认内容       |           `<slot></slot>`           |
|  具名插槽   |      多插槽区分内容      |    `<slot name="header"></slot>`    |
| 作用域插槽  | 子组件传递数据给插槽内容 |    `<slot :data="data"></slot>`     |
| 具名+作用域 |     具名插槽传递数据     | `<slot name="footer" :info="info">` |
| 动态插槽名  |     动态决定插槽名称     |  `<slot :name="slotName"></slot>`   |
