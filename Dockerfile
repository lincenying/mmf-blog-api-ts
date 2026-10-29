# 使用较小的基础镜像
ARG NODE_VERSION=node:24-alpine

FROM $NODE_VERSION AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 1: 仅安装生产依赖
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Stage 2: 构建
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 3: 生产镜像（仅 node + 产物 + prod node_modules）
FROM $NODE_VERSION AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/views ./views
COPY --from=build /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV MONGO_URI=mongodb://host.docker.internal:27017

EXPOSE 4000
CMD ["node", "./dist/app.js"]

# 第一次执行时, 如果node镜像拉不下来, 可以执行以下命令:
# docker pull swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:24.22.2-alpine3.24
# docker tag swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:24.22.2-alpine3.24 node:24-alpine
# docker rmi swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:24.22.2-alpine3.24
# 构建镜像
# docker build -t lincenying/api-express:1.26.0727 -f ./Dockerfile .
# 运行镜像
# docker run -d -p 4000:4000 --name container-api lincenying/api-express:1.26.0727
# 进入镜像
# docker exec -it container-api /bin/sh
# 停止容器
# docker stop container-api
# 删除容器
# docker rm container-api
# 删除镜像
# docker rmi lincenying/api-express:1.26.0727
