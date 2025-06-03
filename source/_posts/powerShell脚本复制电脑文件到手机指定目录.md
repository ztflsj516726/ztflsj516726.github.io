---
title: powerShell脚本复制电脑文件到手机指定目录
date: 2025-06-03 16:11:03
tags:
- 工具
- powerShell
categories: 
- 工具分享
---

## powerShell脚本实现打包项目并把打包的结果复制到手机指定目录

因为`powershell`本身无法直接访问手机存储，所以需要使用`adb`，它是 Android Debug Bridge（安卓调试桥接工具）的缩写，是 Google 提供的一个强大的 **命令行工具**，用于在电脑与 Android 设备之间进行通信与调试。

## `adb`安装步骤

1. ### **`adb`下载（地址 https://developer.android.com/tools/releases/platform-tools?hl=zh-cn）** 

   ![image-20250603170450234](https://fanhua7.oss-cn-beijing.aliyuncs.com/Snipaste_2025-06-03_17-02-17.jpg)

2. ### 下载完成进行解压（比如 解压到D盘，会发现d盘多了`platform-tools`文件夹）

3. ### 添加`D:\platform-tools`到系统环境变量（添加自己解压的路径）

   ![image-20250603170450234](https://fanhua7.oss-cn-beijing.aliyuncs.com/Snipaste_2025-06-03_17-06-52.jpg)

这样就可以使用`adb了`



```powershell
# 设置控制台输出编码，防止中文乱码
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()

Write-Host "🔧 执行构建命令：npm run build:uat"
npm run build:uat

# 本地打包好的目录（$b）
$b = "D:\vscodeProject\work\biandianzhan\04开发\frontend\dist\."

# 手机目录（adb 内的路径）
$a = "/sdcard/Android/data/com.sgcc.sgitg.wxwork/files/zipapp/1012259"

# 检查本地目录是否存在
if (-Not (Test-Path $b)) {
    Write-Host "❌ 源文件夹 $b 不存在"
    exit 1
}

# 检查 adb 是否可用
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 adb 命令，请先安装并配置 adb 环境变量。"
    exit 1
}

# 清空手机目录，防止残留旧文件（需要手机允许 USB 调试）
Write-Host "🧹 清空手机目录 $a ..."
& adb shell rm -rf "$a/*"

# 推送本地目录到手机
Write-Host "📂 拷贝本地目录 $b -> 手机目录 $a ..."
& adb push $b $a

Write-Host "✅ 完成！按任意键退出..."
[void][System.Console]::ReadKey($true)

```

- **`$b`是本地打包好的目录**
- **`$a`是手机指定目录（`adb` 内的路径）**

> [!IMPORTANT]
>
> 新建文件`build-and-copy.ps1`,因为我要执行`npm run build`命令，所以把这个文件放到了前端项目根目录，如果你不需要执行这个命令而且`$b`和`$a`都是绝对路径，那放到任意位置就行。运行方式就行右键该文件选择以powerShell运行。
>
> ![](https://fanhua7.oss-cn-beijing.aliyuncs.com/Snipaste_2025-06-03_17-14-23.jpg)
>
> ![](https://fanhua7.oss-cn-beijing.aliyuncs.com/Snipaste_2025-06-03_17-17-22.jpg)

