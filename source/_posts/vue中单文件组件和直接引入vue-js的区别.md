---
title: vue中单文件组件和直接引入vue.js的区别
date: 2025-05-22 09:33:39
tags:
 - sfc
 - vue.js
categories: 
 - sfc
 - vue.js
---
1. ## 定义和使用方式对比

   #### 单文件组件（SFC）

   - **文件格式**：`.vue` 后缀文件

   - **结构**：包含 `<template>`, `<script>`, `<style>` 三个块

   - 使用：需通过构建工具（如 Vite、Webpack）打包

     ```vue
     <!-- HelloWorld.vue -->
     <template>
       <div>{{ message }}</div>
     </template>
     
     <script>
     export default {
       data() {
         return {
           message: 'Hello from SFC'
         }
       }
     }
     </script>
     
     <style scoped>
     div {
       color: red;
     }
     </style>
     
     ```

   #### 直接引入 Vue.js 脚本

   - 通过 `<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>` 直接引入

   - 无需构建工具，适合简单页面

   - 使用 `Vue.createApp()` 手动挂载组件

     ```html
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title>Vue CDN 示例</title>
       <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
     </head>
     <body>
       <div id="app">
         <p>{{ message }}</p>
         <button @click="sayHello">点击</button>
       </div>
     
       <script>
         const App = {
           data() {
             return {
               message: 'Hello Vue!'
             }
           },
           methods: {
             sayHello() {
               alert('Hello from method!');
             }
           },
           created() {
             console.log('created 生命周期触发');
           },
           mounted() {
             console.log('mounted 生命周期触发');
             sayHello()
           }
         }
     
         Vue.createApp(App).mount('#app');
       </script>
     </body>
     </html>
     
     
     ```

2. ## 适用场景

   |        项目类型        |             推荐方式             |
   | :--------------------: | :------------------------------: |
   | 快速原型开发、小型项目 |         引入 Vue.js 文件         |
   |  生产环境、中大型项目  | 单文件组件 + 构建工具（如 Vite） |

3. ## 开发体验

   |       特性       |    单文件组件 (SFC)    |      引入 Vue.js 脚本       |
   | :--------------: | :--------------------: | :-------------------------: |
   |   代码结构清晰   | ✅ 模板、逻辑、样式分离 | ❌ 一般混写在一个 `<script>` |
   | 支持 TypeScript  |           ✅            |      🚫（需要额外配置）      |
   | 热更新、自动编译 |  ✅ Vite/webpack 支持   |              🚫              |
   |    模块化开发    |  ✅ import/export 支持  |       🚫 一般不分模块        |

4. ## 依赖和构建

   |         项          |          SFC          | 引入 Vue.js |
   | :-----------------: | :-------------------: | :---------: |
   |   是否需 Node.js    |       ✅（必须）       |      ❌      |
   |   是否需打包工具    | ✅（如 Vite、Webpack） |      ❌      |
   | 是否需 NPM 管理依赖 |           ✅           |      ❌      |

5. ## 总结

   |  对比点  |             单文件组件（SFC）              |    引入 Vue.js 文件    |
   | :------: | :----------------------------------------: | :--------------------: |
   | 开发体验 | 好，现代化开发方式，支持模块化、TS、热更新 | 简单，适合新手或小项目 |
   | 适用场景 |         中大型项目，长期维护的项目         | 快速开发、小型静态页面 |
   | 构建依赖 |           需要 Node.js、打包工具           | 无需构建工具，开箱即用 |

   


