# mmf-blog-api-ts

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

After the success of the administrator to add, will automatically generate the admin. Lock file locking, if you need to continue to add, please just delete the file

## docker

如果宿主机起`mongodb`服务, 可以直接使用下面命令构建启动容器,
如果要将`mongodb`也容器化, 可以直接使用`docker-compose`

```bash
# 构建镜像
docker build -t images-api-server -f ./Dockerfile .
# 运行镜像
docker run -d \
-p 4008:4000 \
--name container-api-server \
images-api-server
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
docker-compose up -d
```
