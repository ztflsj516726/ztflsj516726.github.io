---
title: vu2响应式原理
date: 2025-05-21 14:54:36
tags:
- vue2
categories: 
- vue2 
---

## 官方原话：

> [!IMPORTANT]
>
> ​	当你把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的 property，并使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 把这些 property 全部转为 [getter/setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects#定义_getters_与_setters)。`Object.defineProperty` 是 ES5 中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。
>
> ​	这些 getter/setter 对用户来说是不可见的，但是在内部它们让 Vue 能够追踪依赖，在 property 被访问和修改时通知变更。这里需要注意的是不同浏览器在控制台打印数据对象时对 getter/setter 的格式化并不同，所以建议安装 [vue-devtools](https://github.com/vuejs/vue-devtools) 来获取对检查数据更加友好的用户界面。
>
> ​	每个组件实例都对应一个 **watcher** 实例，它会在组件渲染的过程中把“接触”过的数据 property 记录为依赖。之后当依赖项的 setter 触发时，会通知 watcher，从而使它关联的组件重新渲染。

## 拿下边这个vue组件来举例子

```vue
<template>
  <div id="app">
    <h1>{{ message }}</h1>
    <h1>{{ age }}</h1> 
    <button @click="reverseMessage">Reverse Message</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue 2!',
      age:23
    }
  },
  methods: {
    reverseMessage() {
      this.message = this.message.split('').reverse().join('')
    }
  }
}
</script>
```

​	当我们把data这个对象传入到`vue`实例，这个对象的所有`property`会被遍历，并使用`Object.defineProperty`给每个属性打上`getter`和`setter`。

​	getter被触发的时候会收集依赖(看看是哪些组件引用 ，到时候触发setter更新的时候需要更新组件)，setter被重新设置值的时候会被触发，根据getter的记录依赖去更新对应的组件，使其重新渲染。

## 基本流程

​	`你写的 data 对象`   => `Vue 遍历每个属性`  =>  `用 Object.defineProperty 包装成 getter/setter` => 

​	`getter：收集依赖（谁在用这个值）,setter：当值改变，通知依赖更新`

## 响应式封装

```js
let data = { msg: 'hello' }

Object.defineProperty(data, 'msg', {
  get() {
    console.log('getter 被调用')
    return value
  },
  set(newVal) {
    console.log('setter 被调用')
    value = newVal
    // 通知依赖更新
  }
})
// 调用这个msg会触发get 重新赋值这个值会触发set

```

## Vue2响应式封装的局限性

1. #### **无法监听数组的索引赋值或 length 改变**：

   ```vue
   <div> {{ obj.name }} </div>
   
   data(){
       return{
           obj:{
               age:3
           } 
       }
   this.obj.name = 'ztf'  // 不会触发视图更新
   
   //解决方法
   this.$set(obj, 'name', 'ztf') 
   Vue.set(obj, 'name', 'ztf')  // 两种都可以实现  需要手动触发
   ```

2. #### **无法监听数组的索引赋值或 length 改变**：

   ```vue
   <div v-for="item in arr"> {{ item }} </div>
   
   data(){
       return{
           arr:[1,2,3]
       }
   
   this.arr[0] = 2 //不会触发视图更新
   // 解决方法
   this.$set(arr, 0, 2) 
   Vue.set(arr, 0, 2)  // 两种都可以实现  需要手动触发
   
   this.arr.length = 1 //不会触发视图更新
   // 解决方法
   arr.splice[1] (vue2重写了数组的splice方法 导致可以拦截)
   ```

3. #### **对象嵌套层级深，性能开销大（每层都要 defineProperty）**

## 总结

| 项目     | Vue 2 响应式原理                   |
| -------- | ---------------------------------- |
| 实现机制 | `Object.defineProperty`            |
| 特点     | 精细控制每个属性，兼容性强（IE9+） |
| 缺点     | 无法检测属性添加/删除、数组变更    |
| 优点     | 稳定、兼容旧浏览器、逻辑清晰       |
