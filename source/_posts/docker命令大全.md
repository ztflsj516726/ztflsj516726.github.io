---
title: docker命令大全
date: 2025-06-10 16:23:59
tags:
  - docker
---
### docker命令大全

# Docker 常用命令大全

## 📆 镜像操作

### 拉取镜像

```bash
docker pull 镜像名[:标签]
# 例：拉取最新版本的 nginx
docker pull nginx
```

### 查看镜像

```bash
docker images
```

### 删除镜像

```bash
docker rmi 镜像ID|镜像名
# 强制删除
docker rmi -f 镜像ID
```

### 给镜像打标签

```bash
docker tag 原镜像名:标签 新镜像名:标签
```

### 构建镜像

```bash
docker build -t 镜像名:标签 路径
```

------

## 📂 容器操作

### 创建并启动容器

```bash
docker run -d -p 宿主机端口:容器端口 --name 容器名 镜像名
# 例：
docker run -d -p 8080:80 --name web nginx
```

### 查看正在运行的容器

```bash
docker ps
```

### 查看所有容器

```bash
docker ps -a
```

### 停止容器

```bash
docker stop 容器ID|容器名
```

### 启动容器

```bash
docker start 容器ID|容器名
```

### 重启容器

```bash
docker restart 容器ID|容器名
```

### 删除容器

```bash
docker rm 容器ID|容器名
# 强制删除
docker rm -f 容器ID
```

### 查看容器日志

```bash
docker logs -f 容器ID|容器名
```

### 进入容器

```bash
docker exec -it 容器ID|容器名 /bin/bash
```

------

## 🛠️ 镜像与容器管理

### 将容器打包为镜像

```bash
docker commit 容器ID 新镜像名:标签
```

### 保存镜像为本地文件

```bash
docker save -o 文件名.tar 镜像名:标签
```

### 加载本地镜像文件

```bash
docker load -i 文件名.tar
```

### 查看详细信息

```bash
docker inspect 容器ID|镜像ID
```

------

## 🔗 网络操作

### 查看网络

```bash
docker network ls
```

### 创建网络

```bash
docker network create --driver bridge 网络名
```

### 指定网络运行容器

```bash
docker run --network 网络名 ...
```

------

## 📁 数据卷 (Volume)

### 创建数据卷

```bash
docker volume create 卷名
```

### 查看数据卷

```bash
docker volume ls
```

### 查看详细信息

```bash
docker volume inspect 卷名
```

### 删除数据卷

```bash
docker volume rm 卷名
```

### 挂载卷到容器

```bash
docker run -v 卷名:容器路径 镜像名
# 挂载本地目录
docker run -v /本地路径:/容器路径 镜像名
```

------

## 📃 Dockerfile 常用指令

```dockerfile
FROM        # 指定基础镜像
MAINTAINER  # 维护者信息
RUN         # 执行命令
COPY        # 拷贝文件到容器
ADD         # 同 COPY，支持解压
WORKDIR     # 设置工作目录
CMD         # 默认启动命令
ENTRYPOINT  # 启动时的入口命令
EXPOSE      # 宣告端口
ENV         # 环境变量
```

------

## 🧹 清理无用资源

```bash
# 清理停止的容器
docker container prune

# 清理未使用的镜像
docker image prune

# 清理未使用的网络
docker network prune

# 清理未使用的数据卷
docker volume prune

# 一键清理所有未使用资源
docker system prune
```

------

## 📑 其他

```bash
# 查看 Docker 信息
docker info

# 查看 Docker 版本
docker version
```

------

> 📘️ **推荐**：处理多容器应用，建议使用 `docker-compose`。
