---
title: butterfly中解决右上角导航之外的文字样式
date: 2025-04-07 15:21:10
comments: true
author: 赵腾飞
tags: 
- css
categories: 
- butterfly优化
---



### 找到文件 `nav.pug`  在路径`/themes/butterfly/layout/includes/header`下

​      在\#menus 同级的地方 创建div标签，id为`tp-weather-widget`

```html
<div id="tp-weather-widget"></div>
```

### 找到文件 `head.styl`   在路径下`themes\butterfly\source\css\_layout` 下   

​       找到与#nav id选择器同级的地方添加如下代码

```stylus
#tp-weather-widget
  .sw-bar-slim
    color: var(--light-grey)
    mix-blend-mode: difference; // 文件颜色反转
```







