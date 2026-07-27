---
title: 几种http请求方式
date: 2025-09-05 17:38:07
tags:
  - 前端
  - http
---

# HTTP 请求参数传递方式总结

在前后端开发中，客户端向服务端传递数据主要有以下几种方式：

- Path 参数
- Query 参数
- Header 参数
- Body 参数
- FormData
- Cookie
- Session
- 文件流（Binary）
- WebSocket 消息

其中前端业务开发中最常用的是：

> Query、Path、Header、Body、FormData

---

# 一、HTTP 请求基本结构

一个 HTTP 请求大致包含：

```
请求行
请求头 Header
空行
请求体 Body
```

例如：

```http
POST /api/user?id=100 HTTP/1.1

Authorization: Bearer token_xxx
Content-Type: application/json


{
  "name":"Tom",
  "age":18
}
```

其中：

- `/api/user?id=100`

属于 Query 参数。

- `Authorization`

属于 Header 参数。

- `{name:"Tom"}`

属于 Body 参数。

---

# 二、Path 参数（路径参数）

## 1. 定义

参数直接放在 URL 路径中。

例如：

```
GET /users/100
```

其中：

```
100
```

就是用户 id。

---

## 2. 前端传递

```ts
$fetch("/users/100");
```

---

## 3. 后端接收（Spring Boot）

```java
@GetMapping("/users/{id}")
public User getUser(
    @PathVariable Long id
){

}
```

---

## 4. 使用场景

主要表示资源唯一标识。

例如：

查询用户：

```
GET /users/100
```

查询订单：

```
GET /orders/8888
```

删除资源：

```
DELETE /users/100
```

---

## 5. 特点

优点：

- 语义清晰
- 符合 RESTful 风格
- 表示资源关系

缺点：

- 参数数量有限
- 不适合复杂查询条件

---

# 三、Query 参数

## 1. 定义

参数放在 URL 的 `?` 后面。

例如：

```
GET /users?page=1&pageSize=20
```

格式：

```
?key=value&key=value
```

---

## 2. 前端传递

Nuxt / Vue：

```ts
$fetch("/users", {
  query: {
    page: 1,
    pageSize: 20,
  },
});
```

实际请求：

```
GET /users?page=1&pageSize=20
```

---

## 3. 后端接收

Spring Boot：

```java
@GetMapping("/users")
public List<User> list(
    @RequestParam Integer page
){

}
```

---

## 4. 使用场景

### 查询

```
GET /products?keyword=iphone
```

### 分页

```
GET /users?page=2&pageSize=10
```

### 筛选

```
GET /products?category=phone
```

---

## 5. 特点

优点：

- 简单
- 可复制 URL
- 浏览器支持好

缺点：

- 参数暴露在 URL
- 长度有限
- 不适合敏感数据

不要：

```
/login?username=admin&password=123456
```

---

# 四、Header 参数

## 1. 定义

参数放在 HTTP 请求头中。

例如：

```http
Authorization: Bearer token_xxx
```

---

## 2. 前端传递

```ts
$fetch("/user", {
  headers: {
    Authorization: "Bearer token",
  },
});
```

---

## 3. 后端接收

Spring Boot：

```java
@GetMapping("/user")
public User user(
    @RequestHeader("Authorization") String token
){

}
```

---

## 4. 使用场景

### Token

常见：

```
Authorization: Bearer JWT_TOKEN
```

---

### 国际化

例如：

```
Accept-Language: zh-CN
```

---

### 设备信息

例如：

```
Device-Type: Android
```

---

## 5. 特点

适合：

- 全局信息
- 每个请求都需要的数据

不适合：

- 业务参数

---

# 五、Body 参数

## 1. 定义

参数放在请求体中。

常见格式：

```
application/json
```

例如：

```json
{
  "name": "Tom",
  "age": 18
}
```

---

## 2. 前端传递

```ts
$fetch("/user", {
  method: "POST",
  body: {
    name: "Tom",
    age: 18,
  },
});
```

---

## 3. 后端接收

Spring Boot：

```java
@PostMapping("/user")
public void save(
    @RequestBody User user
){

}
```

---

## 4. 使用场景

新增：

```json
{
  "name": "张三"
}
```

修改：

```json
{
  "id": 100,
  "name": "李四"
}
```

复杂查询：

```json
{
  "keyword": "phone",
  "filters": []
}
```

---

## 5. 特点

优点：

- 数据量大
- 支持复杂结构
- 不暴露 URL

缺点：

- GET 一般不使用 Body

---

# 六、FormData

## 1. 定义

FormData 是 Body 的一种格式。

Content-Type：

```
multipart/form-data
```

---

## 2. 普通 JSON 与 FormData 区别

JSON：

```
Content-Type: application/json
```

数据：

```json
{
  "name": "Tom"
}
```

FormData：

```
Content-Type: multipart/form-data
```

数据：

```
name=Tom
file=test.png
```

---

## 3. 前端使用

```ts
const formData = new FormData();

formData.append("username", "Tom");

formData.append("file", file);

fetch("/upload", {
  method: "POST",
  body: formData,
});
```

---

## 4. 使用场景

主要用于：

- 文件上传
- 图片上传
- Excel 导入

例如：

```
头像 + 用户信息
```

---

# 七、Cookie

## 1. 定义

Cookie 是浏览器保存的数据。

请求时自动携带：

```http
Cookie:
token=xxx
```

---

## 2. 使用场景

传统登录：

```
用户登录

↓

服务器生成 session

↓

返回 Cookie

↓

后续自动携带
```

---

## 3. 特点

优点：

- 自动携带
- 适合登录状态

缺点：

- 容易受到 CSRF 影响

---

# 八、Session

## 1. 定义

Session 是服务端保存用户状态的一种方式。

流程：

```
登录

↓

创建 Session

↓

返回 SessionId

↓

Cookie 保存

↓

请求携带 SessionId

↓

服务器找到用户
```

---

# 九、文件流 Binary

## 1. 定义

直接传输二进制数据。

例如：

- 图片
- PDF
- 视频
- Excel

下载：

```
GET /download/file
```

返回：

```
application/pdf
```

---

# 十、WebSocket

## 1. 定义

WebSocket 是长连接通信。

HTTP：

```
请求一次
返回一次
```

WebSocket：

```
连接建立

↓

持续通信
```

---

## 2. 使用场景

- 聊天
- 实时通知
- 股票行情
- 在线协作

---

# 十一、GET 和 POST 为什么很多项目只使用这两个？

虽然 HTTP 有：

```
GET
POST
PUT
DELETE
PATCH
```

但是很多项目只使用：

```
GET
POST
```

原因：

## 1. 历史习惯

很多后台系统：

```
GET 查询

POST 新增

POST 修改

POST 删除
```

例如：

```
POST /user/delete
```

---

## 2. 简单统一

前端：

```ts
request.get();

request.post();
```

学习成本低。

---

## 3. 兼容性

一些老系统、代理、网关对 PUT DELETE 支持不好。

---

## 4. POST 可以完成所有业务操作

例如：

删除：

```
POST /user/delete

{
 id:100
}
```

完全可以实现。

---

# 十二、RESTful 推荐设计

如果按照 REST 风格：

| 操作 | HTTP方法  |
| ---- | --------- |
| 查询 | GET       |
| 新增 | POST      |
| 修改 | PUT/PATCH |
| 删除 | DELETE    |

例如：

查询：

```
GET /users/100
```

新增：

```
POST /users
```

修改：

```
PATCH /users/100
```

删除：

```
DELETE /users/100
```

---

# 十三、实际项目推荐

## 查询接口

```
GET

参数：
query + header
```

例如：

```
GET /users?page=1

Authorization: token
```

---

## 新增修改

```
POST

参数：
body + header
```

例如：

```json
{
  "name": "Tom"
}
```

---

## 文件上传

```
POST

参数：
FormData + header
```

---

## 删除

后台管理系统：

```
POST /delete
```

也可以。

REST：

```
DELETE /users/100
```

---

# 十四、总结表

| 方式      | 位置    | 常见用途         |
| --------- | ------- | ---------------- |
| Path      | URL路径 | 资源ID           |
| Query     | URL参数 | 搜索、分页、筛选 |
| Header    | 请求头  | Token、语言      |
| Body      | 请求体  | 业务数据         |
| FormData  | 请求体  | 文件上传         |
| Cookie    | 浏览器  | 登录状态         |
| Session   | 服务端  | 用户会话         |
| Binary    | 请求体  | 文件传输         |
| WebSocket | 长连接  | 实时通信         |

---

# 日常开发选择

一般业务项目：

```
查询数据
↓
GET + Query + Header


提交数据
↓
POST + Body + Header


上传文件
↓
POST + FormData + Header


资源操作
↓
Path + HTTP Method
```

掌握：

- Query
- Path
- Header
- Body
- FormData

基本可以覆盖绝大部分前后端开发场景。
