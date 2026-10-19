---
title: ref_reactive_依赖追踪 week2
date: 2026-10-19 14:28:58
tags:
---

# Vue 3 学习总结：ref、reactive 与依赖追踪

> 本次学习重点：为什么需要 `ref`、`ref` 与 `reactive` 的响应式机制、普通响应式对象属性中的 ref 解包，以及 `track` / `trigger` 如何通知相关 effect。

## 1. 为什么 Proxy 不能直接代理普通变量？

```ts
let count = 0;
count = 1;
```

普通变量的读取和赋值不会经过对象属性操作，因此不能直接用 `Proxy` 拦截。

`Proxy` 主要用于代理对象：

```ts
const state = new Proxy(
  { count: 0 },
  {
    get(target, key, receiver) {
      console.log("读取属性", key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      console.log("设置属性", key, value);
      return Reflect.set(target, key, value, receiver);
    },
  },
);

state.count; // 触发 get
state.count = 1; // 触发 set
```

**记忆点：** `Proxy` 能拦截对象属性操作，但不能直接拦截普通局部变量本身。

## 2. `ref` 为什么有 `.value`？

```ts
const count = ref(0);
count.value++;
```

`ref(0)` 返回的是一个 Ref 对象，而不是数字 `0`。Vue 通过 `.value` 的 getter/setter 追踪读取和修改。

下面是帮助理解的简化示意，并非 Vue 的完整源码：

```ts
function myRef(initialValue: number) {
  let value = initialValue;

  return {
    get value() {
      // 实际实现会在这里进行依赖收集
      return value;
    },
    set value(newValue: number) {
      // 实际实现会在这里判断变化并通知相关依赖
      value = newValue;
    },
  };
}
```

在普通 JavaScript 中，访问 ref 通常要使用 `.value`：

```ts
const count = ref(0);
console.log(count.value);
count.value = 1;
```

Vue 模板会在适用的位置自动解包顶层 ref：

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <p>{{ count }}</p>
  <button @click="count++">增加</button>
</template>
```

自动解包是 Vue 提供的模板便利，不是 JavaScript 自身的通用规则。

## 3. `ref` 与 `reactive` 的区别

```ts
const count = ref(0);
count.value++;

const state = reactive({ count: 0 });
state.count++;
```

| 对比                | `ref`                            | `reactive`                           |
| ------------------- | -------------------------------- | ------------------------------------ |
| 主要追踪方式        | 通过 `.value` 的 getter/setter   | 通过 Proxy 追踪对象属性              |
| 基本类型            | 可以包装                         | 不能直接把基本类型作为响应式对象使用 |
| 对象类型            | 通常会将内部对象转换为响应式对象 | 直接代理对象                         |
| JavaScript 访问方式 | 通常需要 `.value`                | 直接访问属性                         |

示例：

```ts
const user = ref({ name: "Tom" });
user.value.name = "Jerry";
```

这里涉及两层响应式机制：ref 的 `.value`，以及内部对象属性 `name` 的响应式代理。

## 4. `reactive` 对象属性中的 ref 自动解包

```ts
const count = ref(0);

const state = reactive({
  count,
});

console.log(state.count); // 0
```

原始对象的 `count` 属性保存着 ref，但读取普通 `reactive` 对象的属性时，Vue 会自动解包其中的 ref，返回其 `.value`。

注意：这种自动解包不是对所有容器都适用。数组元素和 `Map` 等集合中的 ref，不会以同样方式自动解包。

### 给这个属性赋值时有什么区别？

```ts
const count = ref(0);
const state = reactive({ count });

state.count = 10;

console.log(count.value); // 10
```

当旧属性值是 ref、赋入的新值不是 ref 时，Vue 通常会把新值写入旧 ref 的 `.value`，而不是直接用数字替换它。

但如果新值本身也是 ref：

```ts
const count = ref(0);
const anotherCount = ref(5);
const state = reactive({ count });

state.count = anotherCount;

console.log(state.count); // 5
console.log(count.value); // 0
console.log(anotherCount.value); // 5
```

此时会用新的 ref 替换属性中原来的 ref，旧的 `count` 不会被修改。

**记忆规则（普通 reactive 对象属性）：**

- 旧值是 ref、新值不是 ref：通常更新旧 ref 的 `.value`。
- 新值本身是 ref：直接替换属性中的 ref。

不要把这条规则直接套用到数组元素或 `Map` 等集合。

## 5. `track` 与 `trigger`

Vue 的响应式系统可以概括为：

- **`track`：依赖收集。** effect 执行期间读取响应式数据，Vue 记录该 effect 对数据的依赖。
- **`trigger`：触发通知。** 数据发生变化时，Vue 通知依赖它的 effect。

```ts
const count = ref(0);

watchEffect(() => {
  console.log(count.value);
});

count.value++;
```

过程：

```text
watchEffect 首次执行
    ↓
读取 count.value
    ↓
track：记录依赖关系
    ↓
count.value 发生变化
    ↓
trigger：通知相关 effect
    ↓
Vue 调度 watchEffect 再次执行
```

Vue 不需要每次修改数据都重新执行所有 effect；它会根据已建立的依赖关系通知相关 effect。

注意：Vue 通常会调度和批处理更新，所以连续同步修改多次数据时，不一定每次修改都会立刻执行一次 effect。

## 6. Vue 怎么知道当前正在运行哪个 effect？

简化理解：

1. `watchEffect` 开始执行时，Vue 将其设为当前活动 effect。
2. 回调读取响应式数据时，Vue 把该数据与当前 effect 关联起来。
3. effect 执行结束后，Vue 恢复之前的追踪上下文（复杂场景还要处理嵌套 effect 等情况）。

例如：

```ts
const count = ref(0);
const name = ref("Tom");

watchEffect(() => {
  console.log(count.value);
});

watchEffect(() => {
  console.log(name.value);
});
```

概念上的依赖关系：

```text
count.value ──→ Effect A
name.value  ──→ Effect B
```

修改 `count.value` 时，会通知依赖 `count` 的 Effect A，而不会仅因为这次修改就重新执行只依赖 `name` 的 Effect B。

## 7. 依赖是动态变化的

```ts
const state = reactive({
  showCount: true,
  count: 0,
  name: "Tom",
});

watchEffect(() => {
  if (state.showCount) {
    console.log(state.count);
  } else {
    console.log(state.name);
  }
});
```

- 首次执行：读取 `showCount` 和 `count`。
- `showCount` 变为 `false` 后，effect 再次执行，读取 `showCount` 和 `name`。
- 旧的 `count` 依赖会被清理。
- 此后单独修改 `count`，通常不会再因为这个 effect 的旧分支而触发它。

**记忆点：** 依赖反映的是 effect 最近一次执行时实际读取了哪些响应式属性，而不是永远固定不变。

## 8. 今日知识主线

```text
普通变量无法被 Proxy 直接拦截
    ↓
ref 通过 .value 提供可追踪的访问入口
    ↓
reactive 通过 Proxy 追踪对象属性
    ↓
effect 读取数据时 track，建立依赖关系
    ↓
数据变化时 trigger，通知相关 effect
    ↓
Vue 调度相关 effect，而不是无差别执行所有 effect
```

## 9. 自测题

建议先尝试自己回答，再看答案。

### 题目 1

为什么 `Proxy` 不能直接代理普通局部变量 `let count = 0`？

### 题目 2

`ref(0)` 返回的是数字 `0`，还是 Ref 对象？为什么普通 JavaScript 中通常需要写 `.value`？

### 题目 3

```ts
const count = ref(0);
const state = reactive({ count });

state.count = 10;
```

执行后，`count.value` 是多少？为什么？

### 题目 4

`track` 和 `trigger` 分别负责什么？

### 题目 5

为什么修改 `count.value` 通常不会让所有 `watchEffect` 都重新执行？

### 题目 6

如果 `watchEffect` 通过条件分支动态读取不同属性，依赖关系会一直累加吗？

---

## 自测答案

1. 因为普通变量的读取和赋值不是对象属性操作，`Proxy` 不能直接拦截它们。
2. 返回的是 Ref 对象。`.value` 是 Vue 用来追踪读取和赋值的入口。
3. `10`。对于普通 `reactive` 对象属性，旧值为 ref、赋入的新值不是 ref 时，Vue 通常更新旧 ref 的 `.value`。
4. `track` 收集依赖；`trigger` 在数据变化时通知相关依赖。
5. 因为 Vue 已经记录数据与 effect 的依赖关系，修改时会通知相关 effect，而不是无差别执行所有 effect。
6. 不会一直累加。effect 重新运行时，Vue 会清理不再使用的旧依赖。

## 一句话回顾

**Vue 3 通过 `ref` 的 `.value` 和 `reactive` 的 Proxy 追踪数据访问；effect 执行时收集依赖，数据变化时通知相关 effect，动态分支还会更新依赖关系。**
