# --- 第一阶段：构建 (Build Stage) ---
FROM node:22-alpine as build-stage

WORKDIR /app

# 先复制 package.json 安装依赖，利用缓存
COPY package.json package-lock.json ./
# 如果 npm 安装慢，可以使用淘宝源
# RUN npm config set registry https://registry.npmmirror.com
RUN npm install

# 复制源代码并构建
COPY . .
# 增加内存限制防止构建溢出 (可选)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# --- 第二阶段：生产环境 (Production Stage) ---
FROM nginx:stable-alpine as production-stage

# 从构建阶段复制 dist 目录到 Nginx 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义的 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]