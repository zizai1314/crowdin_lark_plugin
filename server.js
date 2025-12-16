const express = require('express');
const cors = require('cors');
const path = require('path');
// 动态导入 node-fetch 以支持 CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 基础中间件
app.use(cors()); // 允许跨域
app.use(express.json());

// 2. 托管静态文件 (前端页面)
app.use(express.static(path.join(__dirname, '.')));

// 3. 核心 API 代理逻辑
app.post('/api/lark', async (req, res) => {
    try {
        const { webhookUrl, content } = req.body || {};

        if (!webhookUrl) {
            return res.status(400).json({ error: 'Missing webhookUrl' });
        }

        console.log(`[Proxy] Forwarding to: ${webhookUrl}`);

        // 转发请求给飞书
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8' 
            },
            body: JSON.stringify({
                msg_type: 'text',
                content: { text: content }
            })
        });

        // 处理响应
        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            return res.status(response.status).json({ text: responseText });
        }

        return res.status(response.status).json(responseData);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// 4. SPA 路由支持 (兜底返回首页)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务
app.listen(PORT, () => {
    console.log(`✅ Service running on http://localhost:${PORT}`);
});

