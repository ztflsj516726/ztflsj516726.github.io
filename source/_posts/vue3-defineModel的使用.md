---
title: vue3-defineModel的使用
date: 2025-04-09 15:11:08
tags:
- 工具
categories: 
- vue3 
---

### 基础用法

**默认绑定** `modelValue`

父组件通过`v-model`绑定数据，子组件通过`defineModel()`进行接收

``` html
<!-- 父组件 -->
<ChildComponent v-model="inputValue" />

<script setup>
import { ref } from 'vue';
const inputValue = ref('默认值');
</script>

<!-- 子组件 -->
<template>
  <input v-model="model" />
</template>

<script setup>
const model = defineModel(); // 自动绑定父组件的 v-model
// 这个model就相当于一个ref 可以进行修改，修改完以后就自动触发emit 比如：
model.value = 20   // 这时候父组件的值也会跟着改变
</script>
```

**效果**：修改子组件的`model.value`会同步更新父组件`inputValue`



### 自定义属性名

支持通过参数指定绑定的属性名(如`v-model:title`)

```html
<!-- 父组件 -->
<ChildComponent v-model:title="titleValue" />

<!-- 子组件 -->
<script setup>
const title = defineModel('title'); // 绑定 v-model:title
</script>
```



### 多个`v-model`绑定

同时绑定多个数据

```html
<!-- 父组件 -->
<ChildComponent v-model:name="name" v-model:age="age" />

<!-- 子组件 -->
<script setup>
const name = defineModel('name');
const age = defineModel('age');
</script>
```



### 类型校验与默认值

可传入配置对象定义类型、默认值等：

```js
const model = defineModel({
  type: String,
  default: '默认值',
  required: true
});
```



### 修饰符处理

支持内置修饰符（如 `.trim`、`.number`）和自定义修饰符

```html
<!-- 父组件 -->
<ChildComponent v-model.trim="text" v-model:custom.upper="value" />

<!-- 子组件 -->
<script setup>
const [model, modifiers] = defineModel();
// 根据修饰符处理值
if (modifiers.upper) {
  model.value = model.value.toUpperCase();
}
</script>
```



### 底层原理

`defineModel` 编译后会展开为：

- 一个`modelValue` prop(或自定义属性名)
- 一个`update:modelValue` 事件(或自定义事件名)
- 内部通过`ref`和`watch`实现双向同步

> [!WARNING]
>
> **版本要求**：Vue 3.4+ 支持
>
> **单项数据流**：底层仍是单向数据流，只是通过宏封装了复杂度

官方文档  <https://cn.vuejs.org/api/sfc-script-setup.html#definemodel>

