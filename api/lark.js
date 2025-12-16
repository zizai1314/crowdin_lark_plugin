export default async function handler(req, res) {
  // 设置 CORS headers 允许跨域
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, content } = req.body || {};

    // 定义 webhook URLs
    const WEBHOOKS = {
      dev: 'https://open.larksuite.com/open-apis/bot/v2/hook/164d84f0-c8ba-4aa6-8f03-ea0b422b0987',
      product: 'https://open.larksuite.com/open-apis/bot/v2/hook/b06f809e-bab5-4fa8-b412-a2500333d668'
    };

    const webhookUrl = WEBHOOKS[type];

    if (!webhookUrl) {
      return res.status(400).json({ error: '无效的 webhook 类型' });
    }

    // 调用飞书接口
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: content
        }
      })
    });

    // 飞书接口返回的是 JSON，但有时出错可能返回文本，所以先作为 text 读取
    const responseText = await response.text();
    
    let responseData;
    try {
        responseData = JSON.parse(responseText);
    } catch (e) {
        // 如果不是 JSON，就直接返回文本内容
        return res.status(response.status).json({ text: responseText });
    }

    return res.status(response.status).json(responseData);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}

