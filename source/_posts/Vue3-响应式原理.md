---
title: Vue3 响应式原理 week-1
date: 2026-10-13 11:24:30
tags:
---

# Vue 3 响应式系统学习总结

> 今日主题：`Proxy`、`ref` / `reactive`、解构、依赖追踪、`computed` / `watch` / `watchEffect`、组件更新与 props 稳定性。

## 1. `Proxy` 是什么？

`Proxy` 可以为对象创建一个代理，在读取、设置等操作发生时拦截它们。Vue 3 的 `reactive()` 主要通过 Proxy 代理对象，从而追踪属性访问并响应属性变化。

```ts
const raw = { count: 0 }
const proxy = new Proxy(raw, {
  get(target, key, receiver) {
    console.log('读取属性', key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log('设置属性', key, value)
    return Reflect.set(target, key, value, receiver)
  },
})

proxy.count       // 读取属性
proxy.count = 1   // 设置属性
```

注意：

- `Proxy` 代理的是对象，不会拦截普通局部变量自身的读取和赋值。
- `reactive()` 返回的是响应式代理对象。
- `ref()` 的行为要区分值的类型：对象类型的 `.value` 通常会被转换为响应式对象；基本类型则通过 ref 自身的 `.value` getter/setter 追踪变化，并不是把数字本身变成 Proxy。

## 2. `reactive` 解构为什么可能失去响应式联系？

```ts
const state = reactive({ count: 0 })
const { count } = state

state.count++
console.log(count) // 仍然是 0
```

解构基本类型属性，相当于把当时的值赋给一个新变量：

```ts
const count = state.count
```

`count` 是普通局部变量。之后修改 `state.count` 不会自动修改这个局部变量。

### 对象属性的情况

```ts
const state = reactive({
  user: { name: 'Tom' },
})

const { user } = state
user.name = 'Jerry'

console.log(state.user.name) // 'Jerry'
```

这里 `user` 保存的是同一个嵌套响应式对象的引用，因此修改 `user.name` 也会影响 `state.user.name`。

但重新给局部变量赋值不会替换原对象的属性：

```ts
let { user } = state
user = { name: 'Jerry' }

console.log(state.user.name) // 仍然是原来的值
```

如果需要解构后仍保持与响应式属性的联系，可以使用 `toRefs()`：

```ts
const state = reactive({ count: 0 })
const { count } = toRefs(state)

state.count++
console.log(count.value) // 1
```

## 3. `track` 与 `trigger`

Vue 的响应式系统可以粗略理解为两个步骤：

- **`track`：依赖收集。** 响应式 effect 执行时，读取某个响应式属性，Vue 记录这个 effect 依赖该属性。
- **`trigger`：触发更新。** 之后该属性变化时，Vue 通知依赖它的 effect。

```ts
const state = reactive({ count: 0 })

watchEffect(() => {
  console.log(state.count)
})

state.count++ // count 变化，相关 effect 会再次运行
```

如果 `watchEffect` 中根本没有读取 `state.count`，那么单独修改 `count` 就不会因为这个属性而触发该 effect。

## 4. 依赖可以动态变化

依赖不是永远固定不变的。Vue 会根据 effect **每次实际运行时访问了哪些响应式属性**来更新依赖关系。

```ts
const state = reactive({
  showName: true,
  name: 'Tom',
  age: 23,
})

watchEffect(() => {
  if (state.showName) {
    console.log(state.name)
  } else {
    console.log(state.age)
  }
})
```

- 初次运行：读取 `showName` 和 `name`。
- 把 `showName` 改成 `false` 后：effect 再运行，改为读取 `showName` 和 `age`。
- 此后单独修改 `name`，不再因为这次 effect 的旧分支依赖而触发它。
- 修改 `age` 则会触发它。

Vue 会清理不再使用的旧依赖，而不是只不断累加依赖。

## 5. `computed`：缓存派生状态

```ts
const state = reactive({
  price: 100,
  quantity: 2,
})

const total = computed(() => {
  console.log('计算中')
  return state.price * state.quantity
})

console.log(total.value) // 第一次读取时计算，200
console.log(total.value) // 依赖没变，复用缓存
state.price = 120        // 使计算结果失效
console.log(total.value) // 再次读取时重新计算，240
```

重点：

- `computed` 通常是惰性求值：创建时不会立刻执行 getter，第一次读取 `.value` 时才计算。
- 依赖变化后，计算结果会失效；一般在下次读取时才重新计算。
- 依赖没变时，多次读取会复用缓存。
- 默认计算属性是只读的。
- getter 应尽量保持纯计算，不要在里面发请求或修改其他状态。

适合用在总价、过滤结果、格式化后的显示值等派生状态上。

## 6. `computed`、`watch`、`watchEffect` 的区别

| API           | 依赖如何确定                           | 何时运行                                               | 常见用途                                 |
| ------------- | -------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `computed`    | 自动追踪 getter 中读取的响应式数据     | 通常首次读取时计算；依赖变化后下次读取时重算           | 计算派生值、缓存结果                     |
| `watch`       | 显式指定监听源                         | 默认不立即执行回调；源变化后执行（可配置 `immediate`） | 请求、监听某个值并执行副作用、获取新旧值 |
| `watchEffect` | 自动追踪回调执行过程中读取的响应式数据 | 默认立即执行一次，之后在依赖变化时重新运行             | 依赖自然出现在副作用中的逻辑             |

示例：

```ts
watch(keyword, (newValue, oldValue) => {
  searchApi(newValue)
})
```

这里明确监听 `keyword`。

```ts
watchEffect(() => {
  searchApi(keyword.value, page.value)
})
```

这里会自动追踪执行时读取的 `keyword.value` 和 `page.value`。

### 表单总价：优先使用 `computed`

```vue
<script setup lang="ts">
import { computed, reactive } from 'vue'

const form = reactive({
  price: 100,
  quantity: 2,
})

const total = computed(() => form.price * form.quantity)
</script>

<template>
  <label>
    单价：
    <input v-model.number="form.price" type="number" />
  </label>

  <label>
    数量：
    <input v-model.number="form.quantity" type="number" />
  </label>

  <p>总价：¥{{ total }}</p>
</template>
```

不要为了维护一个可以直接计算出来的 `total`，再用 `watch` 手动同步另一个状态；那样会增加维护成本，也容易出现状态不同步。

## 7. Vue 组件更新的基本流程

示例：

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Tom',
})
</script>

<template>
  <p>{{ state.count }}</p>
  <p>{{ state.name }}</p>
  <button @click="state.count++">增加</button>
</template>
```

点击按钮后，大致过程是：

1. `state.count` 发生变化。
2. `trigger` 通知依赖该属性的组件渲染 effect。
3. Vue 调度父组件更新，重新执行 render function 并生成新的虚拟 DOM。
4. Vue 对比新旧虚拟 DOM，并利用编译优化等机制，尽量只更新实际发生变化的 DOM。

所以，“只更新 count”在真实 DOM 修改层面通常是对的，但不代表 Vue 只执行模板中 `count` 对应的那一小段代码。父组件的渲染逻辑通常会重新运行；没有变化的文本节点一般不需要实际修改。

## 8. 父子组件更新与 props 稳定性

父组件：

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import UserInfo from './UserInfo.vue'

const state = reactive({
  count: 0,
  name: 'Tom',
})
</script>

<template>
  <p>{{ state.count }}</p>
  <UserInfo :name="state.name" />
  <button @click="state.count++">增加</button>
</template>
```

子组件：

```vue
<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <p>用户名：{{ name }}</p>
</template>
```

点击按钮只修改 `count` 时：

- 父组件会更新。
- 父组件重新生成子组件对应的 VNode。
- 如果传给 `UserInfo` 的 `name` 仍然是 `'Tom'`，且没有其他更新原因，子组件通常不需要重新渲染。

**父组件重新渲染，不等于所有子组件都必须重新渲染。**

### 为什么新对象可能让子组件更新？

```vue
<UserInfo :user="{ name: state.name }" />
```

每次父组件重新渲染时，`{ name: state.name }` 都会创建一个新对象：

```ts
const userA = { name: 'Tom' }
const userB = { name: 'Tom' }

userA.name === userB.name // true
userA === userB           // false
```

虽然对象内容相同，但引用不同。Vue 通常会把这个 prop 视为发生了变化，因此子组件可能更新。

优化方式之一是传递稳定的状态引用：

```ts
const state = reactive({
  count: 0,
  user: {
    name: 'Tom',
  },
})
```

```vue
<UserInfo :user="state.user" />
```

只修改 `state.count` 时，`state.user` 的引用不变，通常不会仅仅因为这个 prop 变化而更新子组件。

注意：

- Vue 不会默认对每个对象 prop 做完整深度比较。
- props 稳定不代表子组件永远不会更新。子组件自身依赖变化、prop 真正变化、组件被重新挂载等情况，仍可能触发更新。
- `track` / `trigger` 负责依赖收集和通知；props 比较属于组件更新流程中的另一部分。

## 9. 今日知识主线

```text
Proxy / ref
    ↓
读取响应式数据时收集依赖（track）
    ↓
修改响应式数据时触发相关 effect（trigger）
    ↓
computed / watch / watchEffect 或组件渲染 effect 响应变化
    ↓
组件重新渲染并比较新旧虚拟 DOM
    ↓
根据 props 等更新条件决定子组件是否需要更新
```

## 10. 自测题

建议先自己回答，再查看答案。

### 题目 1：解构

```ts
const state = reactive({ count: 0 })
const { count } = state
state.count++
```

`count` 局部变量会自动变成 `1` 吗？

### 题目 2：动态依赖

```ts
watchEffect(() => {
  if (state.showName) {
    console.log(state.name)
  } else {
    console.log(state.age)
  }
})
```

当 `showName` 变成 `false` 并且 effect 重新运行后，单独修改 `name` 还会触发这个 effect 吗？

### 题目 3：计算属性

`computed` 的依赖变化后，会不会必然立刻执行 getter 重新计算？

### 题目 4：父子组件

父组件因 `count` 变化而重新渲染，但传给子组件的基本类型 prop `name` 没变。子组件是否一定重新渲染？

### 题目 5：对象 prop

```vue
<UserInfo :user="{ name: state.name }" />
```

为什么即使 `state.name` 没变，子组件仍可能更新？

---

## 自测答案

1. 不会。解构得到的是当时的基本类型值；需要保持关联时可使用 `toRefs(state)`。
2. 通常不会。effect 重新运行后不再读取 `name`，旧的 `name` 依赖会被清理。
3. 不会必然立即执行。依赖变化会使缓存失效，通常在下次读取 `.value` 时重新计算。
4. 通常不需要重新渲染，但不能说绝对不会；还要考虑其他更新原因。
5. 每次父组件重新渲染都会创建新的对象引用，即使对象内容相同，Vue 通常也会认为这个 prop 发生了变化。

---

## 一句话回顾

**Vue 3 响应式的核心是追踪 effect 对响应式数据的访问，并在数据变化时通知相关 effect；组件更新时，再结合虚拟 DOM 对比、props 比较和编译优化，尽量避免不必要的 DOM 与子组件更新。**
