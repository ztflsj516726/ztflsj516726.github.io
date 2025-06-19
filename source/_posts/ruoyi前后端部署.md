---
title: ruoyi前后端部署
date: 2025-06-19 17:12:23
tags:
- ruoyi
- 运维
---
# 前端部署

## 1.文件打包

​	我们进行打包的时候不用看`.env.development`的内容只需要关注`.env.production`，因为vite打包默认拿`env.production`的参数,`.env.development`文件里的参数只有执行命令`npm run dev`的使用。

```
# 页面标题
VITE_APP_TITLE = ztf管理系统

# 开发环境配置
VITE_APP_BASE_API = '/dev-api'  #请求接口会默认带上前缀/dev-api

# 若依管理系统/开发环境
VITE_BASE_PATH = 'http://10.0.0.158:8080'

# 是否在打包时开启压缩，支持 gzip 和 brotli
VITE_BUILD_COMPRESS = gzip
```

​	执行`npm run build`（依据`package.json`文件里设置好的，其实就行执行`vite build`），打包完成生成`/dist`

## 2.文件配置

​	在服务器(虚拟机)上创建两个目录  /root/data/ruoyi/ruoyi-font/nginx/html  /root/data/ruoyi/ruoyi-font/nginx/conf  路径可以自行更改，html目录下放置打包好的dist里边内容，conf文件下放置nginx配置文件。

在/conf目录下创建`default.conf`文件

```conf
server {
    listen 80;
    server_name localhost;

    # 静态资源目录
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 接口代理：将 /dev-api 转发到后端服务（如 Spring Boot）
    location /dev-api/ {
        proxy_pass http://10.0.0.158:8080;  //后端地址   
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

```

## 3.服务部署

使用 Docker 开启 nginx 容器：

```
docker run -d \     #后台运行
  --name ruoyi-font \   #容器名称
  -p 80:80 \ #端口映射 第一个是宿主机端口 第二个是容器端口
  -v /root/data/ruoyi/ruoyi-font/nginx/html:/usr/share/nginx/html \ #数据卷挂载，让宿主机和容器的文件同步 同步静态文件
  -v /root/data/ruoyi/ruoyi-font/nginx/conf/default.conf:/etc/nginx/conf.d/default.conf \ #数据卷挂载，让宿主机和容器的文件同步 同步配置文件
  nginx #镜像名称

```

前端部署完成，访问 `http://<虚拟机IP>:80` 即可看到网页。

# 后端部署

## 1.文件打包

​	以idea编辑器为例，利用右侧maven工具先进行clean后进行打包得到`ruoyi-admin.jar`,然后我们的目的就是让jar‘包在服务器上成功运行。

​	我们需要更改数据库和`redis`的地址（如果开发和生产是同一个就不用更改）以及一些线上环境用不到的东西。

​	application application-druid  application-prod是什么关系呢，application就是默认运行的配置文件， 可以看到application中的   spring下的profiles下的active为druid，就是证明application运行的时候也顺带着把 application-druid运行了， application-druid就是我们的数据库配置文件。这是默认情况下，application-prod是不执行的，那要怎么让它也执行呢，java -jar  xxx.jar `--spring.profiles.active=prod,druid`这样就可以了。application 中相同的配置不同值得项会被application-prod中的值覆盖掉。因为我们显示指定了spring.profiles.active，所以application配置的druid就不会生效，我们需要执行prod和druid。

> **配置关系说明**：
>
> - `application.yml` 为默认配置
> - `application-druid.yml` 为数据源
> - `application-prod.yml` 为生产环境配置
> - 如需同时使用：`--spring.profiles.active=prod,druid`

 

`application.yml`

```yml
# 项目相关配置
ruoyi:
  # 名称
  name: ztf
  # 版本
  version: 3.9.0
  # 版权年份
  copyrightYear: 2025
  # 文件路径 示例（ Windows配置D:/ruoyi/uploadPath，Linux配置 /home/ruoyi/uploadPath）
  profile: D:/ruoyi/uploadPath
  # 获取ip地址开关
  addressEnabled: false
  # 验证码类型 math 数字计算 char 字符验证
  captchaType: math

# 开发环境配置
server:
  # 服务器的HTTP端口，默认为8080
  port: 8080
  servlet:
    # 应用的访问路径
    context-path: /dev-api
  tomcat:
    # tomcat的URI编码
    uri-encoding: UTF-8
    # 连接数满后的排队数，默认为100
    accept-count: 1000
    threads:
      # tomcat最大线程数，默认为200
      max: 800
      # Tomcat启动初始化的线程数，默认值10
      min-spare: 100

# 日志配置
logging:
  level:
    com.ruoyi: debug
    org.springframework: warn

# 用户配置
user:
  password:
    # 密码最大错误次数
    maxRetryCount: 5
    # 密码锁定时间（默认10分钟）
    lockTime: 10

# Spring配置
spring:
  # 资源信息
  messages:
    # 国际化资源文件路径
    basename: i18n/messages
  profiles:
    active: druid
  # 文件上传
  servlet:
    multipart:
      # 单个文件大小
      max-file-size: 10MB
      # 设置总上传的文件大小
      max-request-size: 20MB
  # 服务模块
  devtools:
    restart:
      # 热部署开关
      enabled: true
  # redis 配置
  redis:
    # 地址
    host: 10.0.0.158
    # 端口，默认为6379
    port: 6380
    # 数据库索引
    database: 0
    # 密码
    password:
    # 连接超时时间
    timeout: 10s
    lettuce:
      pool:
        # 连接池中的最小空闲连接
        min-idle: 0
        # 连接池中的最大空闲连接
        max-idle: 8
        # 连接池的最大数据库连接数
        max-active: 8
        # #连接池最大阻塞等待时间（使用负值表示没有限制）
        max-wait: -1ms

# token配置
token:
  # 令牌自定义标识
  header: Authorization
  # 令牌密钥
  secret: abcdefghijklmnopqrstuvwxyz
  # 令牌有效期（默认30分钟）
  expireTime: 2400

# MyBatis配置
mybatis:
  # 搜索指定包别名
  typeAliasesPackage: com.ruoyi.**.domain
  # 配置mapper的扫描，找到所有的mapper.xml映射文件
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  # 加载全局的配置文件
  configLocation: classpath:mybatis/mybatis-config.xml
  configuration:
  # 开启驼峰命名
    map-underscore-to-camel-case: true

# PageHelper分页插件
pagehelper:
  helperDialect: mysql
  supportMethodsArguments: true
  params: count=countSql,
  reasonable: true

# Swagger配置
swagger:
  # 是否开启swagger
  enabled: true
  # 标题
  title: ruoyi接口文档
  # 描述
  desc: ruoyi描述


# 防止XSS攻击
xss:
  # 过滤开关
  enabled: true
  # 排除链接（多个用逗号分隔）
  excludes: /system/notice
  # 匹配链接
  urlPatterns: /system/*,/monitor/*,/tool/*

```

`application-druid.yml`

```yml
# 数据源配置
spring:
    datasource:
        type: com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        druid:
            # 主库数据源
            master:
                url: jdbc:mysql://10.0.0.158:3306/ry?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
                username: root
                password: Zhimeilideni990
            # 从库数据源
            slave:
                # 从数据源开关/默认关闭
                enabled: false
                url: 
                username: 
                password: 
            # 初始连接数
            initialSize: 5
            # 最小连接池数量
            minIdle: 10
            # 最大连接池数量
            maxActive: 20
            # 配置获取连接等待超时的时间
            maxWait: 60000
            # 配置连接超时时间
            connectTimeout: 30000
            # 配置网络超时时间
            socketTimeout: 60000
            # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
            timeBetweenEvictionRunsMillis: 60000
            # 配置一个连接在池中最小生存的时间，单位是毫秒
            minEvictableIdleTimeMillis: 300000
            # 配置一个连接在池中最大生存的时间，单位是毫秒
            maxEvictableIdleTimeMillis: 900000
            # 配置检测连接是否有效
            validationQuery: SELECT 1 FROM DUAL
            testWhileIdle: true
            testOnBorrow: false
            testOnReturn: false
            webStatFilter: 
                enabled: true
            statViewServlet:
                enabled: true
                # 设置白名单，不填则允许所有访问
                allow:
                url-pattern: /druid/*
                # 控制台管理用户名和密码
                login-username: root
                login-password: Zhimeilideni990
            filter:
                stat:
                    enabled: true
                    # 慢SQL记录
                    log-slow-sql: true
                    slow-sql-millis: 1000
                    merge-sql: true
                wall:
                    config:
                        multi-statement-allow: true
```

`applicaton-prod.yml`

```yml
# 项目相关配置
ruoyi:
  # 生产环境上传路径，覆盖开发环境路径
  profile: /root/data/ruoyi/uploadPath
# 生产环境配置
server:
  # 端口（如果和开发端口相同，可不写）
  port: 8080
  servlet:
    context-path: /dev-api
  tomcat:
    uri-encoding: UTF-8
    accept-count: 1000
    threads:
      max: 800
      min-spare: 100
# 日志级别覆盖为 info
logging:
  level:
    com.ruoyi: info
    org.springframework: warn

# Redis 覆盖生产环境地址
spring:
  redis:
    host: 10.0.0.158
    port: 6380
    database: 0
    password:
    timeout: 10s
    lettuce:
      pool:
        min-idle: 0
        max-idle: 8
        max-active: 8
        max-wait: -1ms

# Swagger 生产环境一般禁用或按需开启
swagger:
  enabled: true
  title: ruoyi接口文档
  desc: ruoyi描述



```

## 2.镜像构建

在服务器（虚拟机）中创建一个文件夹比如/root/data/ruoyi，把打好的jar包(ruoyi-admin.jar)放进去，创建Dockerfile进行镜像构建。

`Dockerfile`  （名字只能是这个不能变）

```

FROM openjdk:17-jdk-slim  #从官方基础镜像构建

WORKDIR /app  # 工作目录

# 替换为阿里云 Debian 源，加快构建速度
RUN sed -i 's|http://deb.debian.org|https://mirrors.aliyun.com|g' /etc/apt/sources.list \
    && sed -i 's|http://security.debian.org|https://mirrors.aliyun.com|g' /etc/apt/sources.list

# 更新并安装 freetype 字体依赖
RUN apt-get update && apt-get install -y \
    libfreetype6 \
    fonts-dejavu-core \
    fonts-wqy-zenhei \
    --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 复制应用
COPY ruoyi-admin.jar ruoyi-admin.jar

# 启动应用

ENTRYPOINT   ["java", "-Djava.awt.headless=true", "-jar", "ruoyi-admin.jar", "--spring.profiles.active=prod,druid"]

```

执行命令

```
docker build -t my-java-app(镜像名称) .   (.代表当前目录)
```

构建完成可以执行docker images查看自己构建的镜像my-java-app

## 3.容器创建

```
docker run -d -v /root/data/ruoyi/uploadPath:/root/data/ruoyi/uploadPath -p 8080:8080 --name ruoyi-font ruoyi-font-image
```

> [!NOTE]
>
> 注意: -v 是数据卷挂载，用于文件上传相关功能

至此，后端服务部署完成。
