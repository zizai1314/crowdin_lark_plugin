# Crowdin Lark Plugin 私有化部署文档

本文档用于指导运维人员将该 Crowdin 插件部署到私有服务器（非 Vercel 环境）。

## 1. 项目架构说明

该项目是一个 **Web 应用**，由两部分组成：
1. **前端**：静态 HTML/JS/CSS 文件（`index.html`, `app.js` 等）。
2. **后端服务**：`server.js`，提供静态资源托管和 API 代理服务。

## 2. 服务器环境要求

*   **操作系统**：Linux (Ubuntu/CentOS 等)
*   **运行环境**：Node.js >= 18.0.0 (原生支持 fetch)
*   **进程管理**：PM2 (推荐)
*   **Web 服务器**：Nginx (用于反向代理和 HTTPS 卸载)
*   **域名与证书**：必须拥有 HTTPS 证书（Crowdin 强制要求插件必须通过 HTTPS 访问）。

## 3. 部署步骤

### 3.1 获取代码

将项目代码上传至服务器目录，例如 `/opt/crowdin-lark`。

### 3.2 安装依赖

在项目根目录下执行：

```bash
npm install
```

### 3.3 启动服务

使用 PM2 启动 Node.js 服务，确保后台常驻。

```bash
# 安装 PM2 (如果未安装)
npm install -g pm2

# 启动服务 (默认端口 3000)
pm2 start server.js --name "crowdin-lark-plugin"

# 设置开机自启
pm2 save
pm2 startup
```

## 4. Nginx 配置 (HTTPS)

Crowdin 要求插件必须通过 HTTPS 访问。请配置 Nginx 反向代理到本地的 3000 端口。

**Nginx 配置文件参考：**

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为实际域名
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com; # 替换为实际域名

    # SSL 证书路径
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 优化配置 (可选)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000; # 转发给本地 Node 服务
        
        # 必要的 Header
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 5. 验证部署

1. 访问 `https://your-domain.com`，应能看到插件首页。
2. 确保 `manifest.json` 可通过 `https://your-domain.com/manifest.json` 访问。
3. 在 Crowdin 安装应用时，使用上述 Manifest URL。
