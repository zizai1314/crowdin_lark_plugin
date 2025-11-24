// Lark Webhook 配置（写死在前端）
const LARK_CONFIG = {
    // Lark Webhook URL，从 Lark 群组机器人获取
    webhookUrl: 'https://open.larksuite.com/open-apis/bot/v2/hook/164d84f0-c8ba-4aa6-8f03-ea0b422b0987'
};

// 发送 Lark 消息（使用 Webhook）
async function sendLarkMessage(content) {
    try {
        const message = {
            msg_type: 'text',
            content: {
                text: content
            }
        };

        const response = await fetch(LARK_CONFIG.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(message)
        });

        const responseText = await response.text();
        
        // 检查 HTTP 状态码
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        // 尝试解析 JSON 响应
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            // 如果响应不是 JSON，但 HTTP 状态是 200，通常表示成功
            if (response.status === 200) {
                return { success: true, data: { text: responseText } };
            }
            throw new Error(`响应解析失败: ${responseText}`);
        }

        // Lark Webhook 成功响应可能是空对象 {} 或包含 code: 0
        // 只要 HTTP 200 且没有错误信息，就认为成功
        if (response.status === 200) {
            if (responseData.code === 0 || responseData.StatusCode === 0 || Object.keys(responseData).length === 0) {
                return { success: true, data: responseData };
            }
            // 如果有错误信息
            if (responseData.msg || responseData.Message) {
                throw new Error(responseData.msg || responseData.Message);
            }
            // 默认认为成功
            return { success: true, data: responseData };
        }
        
        throw new Error(`未知错误: ${JSON.stringify(responseData)}`);
    } catch (error) {
        console.error('发送消息错误:', error);
        throw error;
    }
}

// 显示消息提示
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    // 3秒后自动隐藏成功消息
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// 主函数：发送通知
async function sendLarkNotification() {
    const button = document.getElementById('sendLarkBtn');
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');

    // 禁用按钮并显示加载状态
    button.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline-block';

    try {
        // 发送消息
        showMessage('正在发送消息...', 'info');
        const currentTime = new Date().toLocaleString('zh-CN');
        
        // 构建通知内容（参考脚本格式）
        const messageContent = `🎯 Crowdin翻译完成通知

📋 任务标题：Crowdin翻译完成

📊 执行状态：成功

📝 详细信息：产品侧已完成翻译，请开发侧进行后续处理

⏰ 执行时间：${currentTime}

💡 后续流程：
1. 开发侧收到通知后进行后续处理
2. 下载翻译文件并合并到项目`;

        await sendLarkMessage(messageContent);

        // 显示成功消息
        showMessage('✅ Lark 通知发送成功！', 'success');
    } catch (error) {
        console.error('发送通知失败:', error);
        showMessage(`❌ 发送失败: ${error.message}`, 'error');
    } finally {
        // 恢复按钮状态
        button.disabled = false;
        buttonText.style.display = 'inline-block';
        buttonLoading.style.display = 'none';
    }
}

// 绑定按钮点击事件
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendLarkBtn');
    sendButton.addEventListener('click', sendLarkNotification);
});

