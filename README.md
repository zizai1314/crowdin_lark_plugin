# Crowdin Lark 通知插件

这是一个用于 Crowdin 平台的插件，提供一键发送 Lark（飞书）通知的功能。

## 功能特性

- 🚀 一键发送 Lark 通知
- 💻 纯前端实现，无需后端服务
- 🎨 简洁美观的 UI 界面
- ⚡ 快速响应，实时反馈

## 使用说明

### 1. 配置 Lark Webhook URL

编辑 `app.js` 文件，修改以下配置：

```javascript
const LARK_CONFIG = {
    // Lark Webhook URL，从 Lark 群组机器人获取
    webhookUrl: 'https://open.larksuite.com/open-apis/bot/v2/hook/your_webhook_id'
};
```

### 2. 获取 Lark Webhook URL

1. 在 Lark 中创建一个群组（或使用现有群组）
2. 在群组中添加「自定义机器人」
3. 创建机器人时选择「自定义机器人」
4. 设置机器人名称和描述
5. 创建后，Lark 会提供一个 Webhook URL，格式类似：
   ```
   https://open.larksuite.com/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
6. 将 Webhook URL 复制到 `app.js` 的 `LARK_CONFIG.webhookUrl` 中

### 3. 消息格式

插件发送的消息格式参考了 Crowdin 自动化脚本的格式，包含：
- 任务标题
- 执行状态
- 详细信息
- 执行时间
- 后续流程说明

你可以在 `app.js` 的 `sendLarkNotification` 函数中自定义消息内容。

### 4. 部署到 Crowdin

#### 方式一：作为 Crowdin App 部署

1. 将项目文件上传到可访问的服务器
2. 在 Crowdin 开发者平台创建 App
3. 配置 App 的入口 URL 为 `index.html` 的地址
4. 设置 App 的权限和配置

#### 方式二：作为浏览器扩展

1. 可以将代码打包为浏览器扩展
2. 在 Crowdin 页面中注入脚本

#### 方式三：直接嵌入（如果 Crowdin 支持）

1. 将代码部署到静态服务器
2. 在 Crowdin 项目中添加自定义 Widget
3. 使用 iframe 嵌入插件页面

## 文件结构

```
crowdin_lark_plugin/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── app.js          # 主要逻辑代码
└── README.md       # 说明文档
```

## 技术说明

### API 调用流程

1. **获取访问令牌**
   - 使用 App ID 和 App Secret 调用 `/auth/v3/tenant_access_token/internal`
   - 获取 `tenant_access_token`

2. **发送消息**
   - 使用访问令牌调用 `/im/v1/messages`
   - 指定接收者 ID 和消息内容

### 注意事项

⚠️ **安全提示**：
- Webhook URL 包含敏感信息，请妥善保管
- 建议在生产环境中对 Webhook URL 进行加密或使用环境变量
- Webhook URL 泄露可能导致消息被恶意发送，请定期更换

## 开发

### 本地测试

1. 使用本地服务器运行：
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

2. 在浏览器中访问 `http://localhost:8000`

### 修改消息内容

在 `app.js` 的 `sendLarkNotification` 函数中修改消息内容：

```javascript
const messageContent = `你的自定义消息内容`;
```

## 常见问题

### Q: 提示 "发送消息失败"
A: 检查 Webhook URL 是否正确，确保：
- Webhook URL 完整且未过期
- 机器人未被删除或禁用
- 网络连接正常，可以访问 Lark 服务器

### Q: Webhook URL 在哪里获取？
A: 在 Lark 群组中，点击「设置」→「群机器人」→「自定义机器人」，创建后即可获取 Webhook URL。

### Q: 可以自定义消息内容吗？
A: 可以，编辑 `app.js` 文件中 `sendLarkNotification` 函数里的 `messageContent` 变量即可。

## 许可证

MIT License

