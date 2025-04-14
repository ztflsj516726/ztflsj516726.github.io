---
title: el-upload多文件上传，on-success回调函数参数res被覆盖问题
date: 2025-04-14 15:08:17
tags: 
- 文件上传
categories:
- elementui
---

> [!NOTE]
>
> 当我们使用`el-upload`的`action`进行自动多文件上传的时候， 虽然看浏览器发起的请求是调用了多次文件上传接口，但是回调函数`on-success`的只执行了一次，我们拿不到后续的res无法对第一个之后的文件进行自定义操作。经过排查后发现在`on-success`回调函数中，**当上传没有执行完毕不能在函数中有修改`fileList(已上传文件列表)`值的操作，否则会导致文件上传回调终止。**

#### 这是一个简单的上传组件

```html
 <el-upload multiple :headers="headers" :action="uploadFileUrl" 
        :accept="defaultFormat" :limit="defaultLimit"
        :file-list="fileList" :disabled="!options.isEdit" 
        :on-exceed="handleExceed" :before-upload="handleBeforeUpload"
        :on-error="handleUploadError" :before-remove="handleDelete" :on-success="handleUploadSuccess"
        :on-preview="handlePreview">
    <el-button link type="primary" icon="Upload" class="icon-upload" :title="options.name ||
      `请上传${defaultFormat}格式，小于${defaultMaxSize}MB`"></el-button>
 </el-upload>
```

on-success回调函数`handleUploadSuccess`接收三个参数，(`res`,`file`,`files`)

#### 这是`handleUploadSuccess`回调函数

```js
function handleUploadSuccess(res, file, files) {
  // // 等待所有文件都上传完毕再更改fileList的值，否则将会停止后边的文件上传
  const uploadSuccessAll = files.every(item => item.status !== "uploading")
  if (uploadSuccessAll) {
    emits('uploadSuccess', files.map(item => item.response.data))
    let oldList = props?.fileList || [];
    // 新上传的文件列表
    let addFileList = []
    // 对上传成功的文件进行自定义操作，添加到addFileList中
    // 上传成功以后files中的每个item会有response参数来显示上传的结果（如下代码块）
    files.forEach(item => {
      if (item.response && item.response.code === 200) {
        const { name, id } = item.response.data
        addFileList.push({ name, url: id, id })
      } else {
        proxy.$modal.msgError(response.msg);
      }
    })
    emits("update:fileList", [
      ...oldList,
      ...addFileList, // 对所有文件进行格式化处理后统一添加到fileList中
    ]);
  }
}
```

#### 上传成功以后files中的每个item会有response参数来显示上传的结果

```json
[
    {
        "name": "一个文件.pdf",
        "percentage": 100,
        "status": "success",
        "size": 24851,
        "raw": {
            "uid": 1744615543218
        },
        "uid": 1744615543218,
        "response": {
            "code": 200,
            "msg": null,
            "data": {
                "createBy": "ztf",
                "createTime": "2025-04-14 15:25:43",
                "updateBy": "ztf",
                "updateTime": "2025-04-14 15:25:43",
                "id": "1911682261840883714",
                "delFlag": null,
                "fileName": "一个文件.pdf",
                "filePath": "/2025/04/14/一个文件_20250414152543A088.pdf",
                "businessId": null,
                "businessType1": null,
                "businessType2": null,
                "businessType3": null,
                "businessRemark": null,
                "storageType": "osfile",
                "name": "一个文件.pdf"
            },
            "total": null
        }
    },
    {
        "name": "二个文件.pdf",
        "percentage": 100,
        "status": "success",
        "size": 24851,
        "raw": {
            "uid": 1744615543220
        },
        "uid": 1744615543220,
        "response": {
            "code": 200,
            "msg": null,
            "data": {
                "createBy": "ztf",
                "createTime": "2025-04-14 15:25:43",
                "updateBy": "ztf",
                "updateTime": "2025-04-14 15:25:43",
                "id": "1911682261845078018",
                "delFlag": null,
                "fileName": "二个文件.pdf",
                "filePath": "/2025/04/14/二个文件_20250414152543A089.pdf",
                "businessId": null,
                "businessType1": null,
                "businessType2": null,
                "businessType3": null,
                "businessRemark": null,
                "storageType": "osfile",
                "name": "二个文件.pdf"
            },
            "total": null
        }
    },
    {
        "name": "调出.pdf",
        "percentage": 100,
        "status": "success",
        "size": 0,
        "raw": {
            "uid": 1744615543221
        },
        "uid": 1744615543221,
        "response": {
            "code": 200,
            "msg": null,
            "data": {
                "createBy": "ztf",
                "createTime": "2025-04-14 15:25:43",
                "updateBy": "ztf",
                "updateTime": "2025-04-14 15:25:43",
                "id": "1911682261845078019",
                "delFlag": null,
                "fileName": "调出.pdf",
                "filePath": "/2025/04/14/调出_20250414152543A090.pdf",
                "businessId": null,
                "businessType1": null,
                "businessType2": null,
                "businessType3": null,
                "businessRemark": null,
                "storageType": "osfile",
                "name": "调出.pdf"
            },
            "total": null
        }
    }
]
```

