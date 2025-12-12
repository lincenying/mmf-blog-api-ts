# 使用较小的基础镜像
ARG NODE_VERSION=node:22-alpine

# 生产环境镜像
FROM $NODE_VERSION AS dependency-base

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 使用pnpm安装依赖
RUN pnpm install --frozen-lockfile --ignore-scripts

# 编译项目
RUN pnpm build

# Stage 2: Production image
FROM $NODE_VERSION AS production

# Create app directory
WORKDIR /app

# Copy built assets from previous stage
COPY --from=dependency-base /app/dist /app/dist
COPY --from=dependency-base /app/public /app/public
COPY --from=dependency-base /app/views /app/views
COPY --from=dependency-base /app/package.json /app/package.json
COPY --from=dependency-base /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=dependency-base /app/.npmrc /app/.npmrc

RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm

RUN pnpm install --only=prod

RUN pnpm store prune

# 设置环境变量
## 生产环境
ENV NODE_ENV=production
## 如果没有将mongodb容器化, name数据库地址为宿主机数据库地址
ENV MONGO_URI=mongodb://host.docker.internal:27017

EXPOSE 4000

# 启动项目
CMD ["node", "./dist/app.js"]

# 第一次执行时, 如果node镜像拉不下来, 可以执行以下命令:
# docker pull swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22
# docker tag swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22 node:22-alpine
# 构建镜像
# docker build -t lincenying/api-server:1.25.1029 -f ./Dockerfile .
# 运行镜像
# docker run -d -p 4008:4000 --name container-api lincenying/api-server:1.25.1029
# 进入镜像
# docker exec -it container-api /bin/sh
# 停止容器
# docker stop container-api
# 删除容器
# docker rm container-api
# 删除镜像
# docker rmi lincenying/api-server:1.25.1029
