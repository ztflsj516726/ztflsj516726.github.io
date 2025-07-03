---
title: docker设置快捷命令
date: 2025-07-03 10:10:47
tags:
- docker
- 快捷命令
---

1. ### 输入命令编辑进入/root/.bashrc

   ```sh
   vi /root/.bashrc
   ```

2. ### 在末尾追加（dpsa是快捷命令，=后边是真实执行的命令）

   ```sh
   alias dpsa='docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}"'
   ```

   追加完成后`esc`退出编辑模式，`:wq`退出并保存

3. ### 重启配置文件

   ```sh
   source ~/.bashrc
   ```

4. ### 验证命令

   ```
   [root@iZ2vc5alcmxzfi3c3x0rp6Z ~]# dpsa
   NAMES              STATUS                    IMAGE                           PORTS
   ruoyi-back         Up 22 minutes             ruoyi-backend                   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp
   ruoyi-font         Up 22 minutes             nginx                           0.0.0.0:80->80/tcp, :::80->80/tcp
   portainer          Up 16 hours               portainer/portainer-ce:latest   8000/tcp, 9443/tcp, 0.0.0.0:9000->9000/tcp, :::9000->9000/tcp
   my-redis           Up 25 hours               redis:latest                    0.0.0.0:6379->6379/tcp, :::6379->6379/tcp
   brithday           Exited (0) 26 hours ago   nginx                           
   data-navidrome-1   Up 25 hours               deluan/navidrome:latest         0.0.0.0:4533->4533/tcp, :::4533->4533/tcp
   
   ```

   

