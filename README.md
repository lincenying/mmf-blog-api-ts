# mmf-blog-api-ts

## 如何使用

在 src/config 文件夹下 创建 mpapp.js 文件
里面写入: (小程序登录用的)

```javascript
exports.apiId = ''
exports.secret = ''
```

在 src/config 文件夹下 创建 shihua.js 文件
里面写入: (百度识花用的)
接口申请地址: http://ai.baidu.com/tech/imagerecognition

```javascript
exports.APP_ID = ''
exports.API_KEY = ''
exports.SECRET_KEY = ''
```

install nodejs, MongoDB, And start the

```bash
# Install dependencies
pnpm install & npx simple-git-hooks

# or
npm install & npx simple-git-hooks

# Start the API server
pnpm serve
```

Add admin
http://localhost:4000/backend

管理员添加成功后，会自动生成admin.Lock文件锁定，如需继续添加，请直接删除该文件

After the success of the administrator to add, will automatically generate the admin. Lock file locking, if you need to continue to add, please just delete the file

## 注意mongoose的版本

| MongoDB Server | Mongoose                                          |
| -------------- | ------------------------------------------------- |
| 8.x            | ^8.7.0                                            |
| 7.x            | ^7.4.0 &vert; ^8.0.0                              |
| 6.x            | ^6.5.0 &vert; ^7.0.0 &vert; ^8.0.0                |
| 5.x            | ^5.13.0 &vert; ^6.0.0 &vert; ^7.0.0 &vert; ^8.0.0 |
| 4.4.x          | ^5.10.0 &vert; ^6.0.0 &vert; ^7.0.0 &vert; ^8.0.0 |
| 4.2.x          | ^5.7.0 &vert; ^6.0.0 &vert; ^7.0.0 &vert; ^8.0.0  |
| 4.0.x          | ^5.2.0 &vert; ^6.0.0 &vert; ^7.0.0 &vert; ^8.0.0  |
| 3.6.x          | ^5.0.0 &vert; ^6.0.0 &vert; ^7.0.0 &vert; ^8.0.0  |
| 3.4.x          | ^4.7.3 &vert; ^5.0.0                              |
| 3.2.x          | ^4.3.0 &vert; ^5.0.0                              |
| 3.0.x          | ^3.8.22 &vert; ^4.0.0 &vert; ^5.0.0               |
| 2.6.x          | ^3.8.8 &vert; ^4.0.0 &vert; ^5.0.0                |
| 2.4.x          | ^3.8.0 &vert; ^4.0.0                              |

自行根据系统MongoDB的版本, 安装对应mongoose版本

## docker

如果宿主机起`mongodb`服务, 可以直接使用下面命令构建启动容器,
如果要将`mongodb`也容器化, 可以直接使用`docker-compose`

```bash
# 第一次执行时, 如果node镜像拉不下来, 可以执行以下命令:
docker pull swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22
docker tag swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22 node:22-alpine
# 构建镜像
docker build -t lincenying/api-server:1.25.0414 -f ./Dockerfile .
# 运行镜像
docker run -d \
-p 4008:4000 \
--name container-api-server \
lincenying/api-server:1.25.0414
# 进入容器
docker exec -it container-api-server /bin/bash
# 停止容器
docker stop container-api-server
# 删除容器
docker rm container-api-server
# 删除镜像
docker rmi images-api-server
```

## docker-compose

修改`docker-compose.yml`中的`mongo.volumes`配置, 将宿主机数据库路径映射到容器中

```yaml
volumes:
  - /Users/lincenying/web/mongodb/data:/data/db
```

```bash
# 生成镜像及启动容器
docker-compose build
docker-compose up -d
```
