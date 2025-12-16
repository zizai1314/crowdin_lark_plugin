const LARK_CONFIG = {
    dev: 'dev',
    product: 'product'
};

async function sendLarkMessage(content, type) {
    try {
        // 使用后端代理接口，解决跨域问题
        const response = await fetch('/api/lark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                type: type,
                content: content
            })
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            if (response.status === 200) {
                return { success: true, data: { text: responseText } };
            }
            throw new Error(`响应解析失败: ${responseText}`);
        }

        if (response.status === 200) {
            if (responseData.code === 0 || responseData.StatusCode === 0 || Object.keys(responseData).length === 0) {
                return { success: true, data: responseData };
            }
            
            if (responseData.msg || responseData.Message) {
                throw new Error(responseData.msg || responseData.Message);
            }
            
            return { success: true, data: responseData };
        }
        
        throw new Error(`未知错误: ${JSON.stringify(responseData)}`);
    } catch (error) {
        console.error('发送消息错误:', error);
        throw error;
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    button.disabled = loading;
    buttonText.style.display = loading ? 'none' : 'inline-block';
    buttonLoading.style.display = loading ? 'inline-block' : 'none';
}

async function sendNotification(buttonId, type, loadingMessage, successMessage, messageContent) {
    setButtonLoading(buttonId, true);
    
    try {
        showMessage(loadingMessage, 'info');
        await sendLarkMessage(messageContent, type);
        showMessage(successMessage, 'success');
    } catch (error) {
        console.error('发送通知失败:', error);
        showMessage(`❌ 发送失败: ${error.message}`, 'error');
    } finally {
        setButtonLoading(buttonId, false);
    }
}

async function sendLarkNotification() {
    const currentTime = new Date().toLocaleString('zh-CN');
    const messageContent = `🎯 Crowdin翻译完成通知

📋 任务标题：Crowdin翻译完成

📊 执行状态：成功

📝 详细信息：产品侧已完成翻译，请开发侧进行后续处理

⏰ 执行时间：${currentTime}

💡 后续流程：
1. 开发侧收到通知后进行后续处理
2. 下载翻译文件并合并到项目`;

    await sendNotification(
        'sendLarkBtn',
        LARK_CONFIG.dev,
        '正在通知开发侧...',
        '✅ 开发侧通知发送成功！',
        messageContent
    );
}

async function sendVerifyPassNotification() {
    const currentTime = new Date().toLocaleString('zh-CN');
    const messageContent = `✅ Crowdin翻译人工校验通过通知

📋 任务标题：翻译内容人工校验通过

📊 执行状态：人工校验通过

📝 详细信息：产品侧已完成翻译内容人工校验，翻译质量符合要求

⏰ 执行时间：${currentTime}

💡 后续流程：
1. 翻译内容已通过产品侧人工校验
2. 可以进行后续发布流程`;

    await sendNotification(
        'verifyPassBtn',
        LARK_CONFIG.product,
        '正在发送人工校验通过通知...',
        '✅ 人工校验通过通知发送成功！',
        messageContent
    );
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendLarkBtn').addEventListener('click', sendLarkNotification);
    document.getElementById('verifyPassBtn').addEventListener('click', sendVerifyPassNotification);
});
