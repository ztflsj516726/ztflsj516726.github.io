---
title: dto和vo何时使用
date: 2025-06-25 14:27:31
tags:
  - java
  - spring
---

## ✅DTO 和 VO 的本质作用

| 类型 | 全称                                 | 主要用途                               |
| ---- | ------------------------------------ | -------------------------------------- |
| DTO  | Data Transfer Object（数据传输对象） | **接收参数**：前端传给后端的请求体数据 |
| VO   | View Object（视图对象）              | **返回数据**：后端返回给前端的结果结构 |

## 🧠 为什么要区分 DTO、VO、Entity？

主要是为了**分层清晰、职责单一**、避免出错，尤其在**复杂业务或多人协作项目中非常重要**。



## ✅应该使用 DTO / VO 的典型场景

1. ### **Entity（实体类）与请求/响应字段不一致时**

   比如数据库里有 `apply_user_id`，但前端传来的是：

   ```json
   {
     "applyUserId": 1,
     "deptName": "采购部"
   }
   ```

   你就需要：

   - `DTO`:`applyUserId`
   - `VO`:`deptName`
   - `Entity`:`apply_user_id`

2. ### 前端不应该看到的字段要隐藏时（敏感数据）

   比如数据库表中有字段：

   ```java
   private String password;
   ```

   你不能直接把实体类返回给前端，就要用 VO 去剔除这些字段。

3. ### 多表关联、拼接扩展字段时

   比如你申请单的实体里只有 `deptId`，但你希望返回时能带上 `deptName`。

   此时就用 VO：

   ```
   public class AssetApplyVO {
       private Long deptId;
       private String deptName; // 来自关联查询
   }
   ```

   

4. ### 前端传复杂查询条件或分页参数时

   前端请求

   ```json
   {
     "pageNum": 1,
     "pageSize": 10,
     "applyUserName": "张三",
     "startDate": "2024-01-01"
   }
   ```

   这些字段不一定在数据库中有，就需要用一个 `DTO` 专门接收，比如：

   ```
   public class AssetApplyQueryDto {
       private Integer pageNum;
       private Integer pageSize;
       private String applyUserName;
       private Date startDate;
   }
   ```

   

5. ### 防止 Entity 被误用修改/持久化

   有些人为了图方便，直接把请求体绑定到实体类，然后又用这个对象去存数据库 —— 这很容易出错！

   比如前端传了一个非法字段，就可能被你无意中插入了数据库。

   使用 DTO / VO 可避免此类风险。

## ✅ 最推荐的分层方式（业界规范）：

Controller 层    --> 接收 DTO         （接收参数）
Service 层       --> 用 Entity 处理    （数据库交互）
Controller 层    <-- 返回 VO         （返回前端）



## 一个curd的操作

| 操作类型 | 是否用 DTO | 是否用 VO | 是否用 Entity | 说明              |
| -------- | ---------- | --------- | ------------- | ----------------- |
| 新增     | ✅ 是       | ❌ 否      | ✅ 是          | DTO → Entity      |
| 修改     | ✅ 是       | ❌ 否      | ✅ 是          | DTO → Entity      |
| 删除     | ❌ 否       | ❌ 否      | ✅ 是          | 直接用 id 删除    |
| 查询详情 | ❌ 否       | ✅ 是      | ✅ 是          | Entity → VO       |
| 查询列表 | ✅ 是       | ✅ 是      | ✅ 是          | DTO + Entity → VO |

