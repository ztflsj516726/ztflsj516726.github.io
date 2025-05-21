---
title: vue3-组合式函数(hooks)
date: 2025-05-07 15:57:14
author: 赵腾飞
comments: true
tags: 
- vue3
- 组合式函数
- 函数
---

## vue3组合式函数

用一个场景来解释普通函数和组合式函数的区别：

> [!IMPORTANT]
>
> 一个计数器组件，点击按钮增加数字，并格式化显示当前时间。

#### 普通函数（格式化当前时间）

```js
// 格式化当前时间
export function formatDate(date: Date): string {
  return date.toLocaleString()
}

```

#### 组合式函数（封装响应式状态和逻辑）

```js
// use***开头的开始都是hooks 返回一些数和方法供使用
import { ref } from 'vue'
import { formatDate } from '../utils/format'

export function useCounter() {
  const count = ref(0)
  const lastUpdated = ref(formatDate(new Date()))

  const increment = () => {
    count.value++
    lastUpdated.value = formatDate(new Date())
  }
	// 等于说 count lastUpdated increment 在setUp中是已经定义好的
  return {
    count,
    lastUpdated,
    increment
  }
}

```

#### 在组件中使用

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Last Updated: {{ lastUpdated }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { useCounter } from '../composables/useCounter'

// 调用useCounter返回数据和方法
const { count, lastUpdated, increment } = useCounter()
</script>

```

#### 普通函数和hooks函数的区别

| 对比项           | 组合式函数（Composition Functions） | 自定义函数（普通 JS 函数）   |
| ---------------- | ----------------------------------- | ---------------------------- |
| 用途             | 封装 Vue 响应式逻辑、生命周期等     | 封装普通业务逻辑、工具函数等 |
| 是否依赖 Vue API | 是                                  | 否                           |
| 调用位置限制     | 只能在 `setup()` 或组合式函数中使用 | 无限制                       |
| 响应式支持       | 支持 Vue 的响应式系统               | 不支持                       |
| 示例             | `useXXX()`                          | `formatXXX()`                |
