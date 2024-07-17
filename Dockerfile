# Use a smaller base image
ARG NODE_VERSION=node:18-alpine

# Production image
FROM $NODE_VERSION AS production

# Install pnpm
RUN npm config set registry https://registry.npmmirror.com

RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy the package files
COPY . .

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Define environment variables
ENV NODE_ENV=production \
    HOST_API_URL=mongodb://host.docker.internal:27017


EXPOSE 4000

# Start the app
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
