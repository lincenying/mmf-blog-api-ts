# 使用较小的基础镜像
ARG NODE_VERSION=node:18-alpine

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
RUN pnpm install --frozen-lockfile

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

# 构建镜像
# docker build -t mmf-blog-api-ts -f ./Dockerfile .
# 运行镜像
# docker run -d -p 4008:4000 --name container-api mmf-blog-api-ts
# 进入镜像
# docker exec -it container-api /bin/sh
# 停止容器
# docker stop container-api
# 删除容器
# docker rm container-api
# 删除镜像
# docker rmi mmf-blog-api-ts
