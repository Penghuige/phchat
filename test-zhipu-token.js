// 测试智谱AI JWT token生成
// 使用方法: node test-zhipu-token.js

const crypto = require('crypto');

function base64UrlEncode(str) {
  const base64 = Buffer.from(str).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function createHMACSHA256(message, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  const signature = hmac.digest();
  return base64UrlEncode(signature);
}

function generateZhipuToken(apiKey) {
  const [id, secret] = apiKey.split('.');
  
  if (!id || !secret) {
    throw new Error("Invalid Zhipu API key format. Expected format: {id}.{secret}");
  }

  const header = {
    alg: "HS256",
    sign_type: "SIGN"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    api_key: id,
    exp: now + 3600,
    timestamp: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHMACSHA256(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 测试函数
function testTokenGeneration() {
  // 请替换为您的实际API密钥
  const testApiKey = "your_id.your_secret";
  
  try {
    const token = generateZhipuToken(testApiKey);
    console.log("Generated token:", token);
    console.log("Token length:", token.length);
    
    // 解析token
    const parts = token.split('.');
    console.log("Token parts:", parts.length);
    
    if (parts.length === 3) {
      console.log("✅ Token format is correct");
      
      // 解码payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log("Payload:", payload);
      
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp > now) {
        console.log("✅ Token is not expired");
      } else {
        console.log("❌ Token is expired");
      }
    } else {
      console.log("❌ Token format is incorrect");
    }
  } catch (error) {
    console.error("Error generating token:", error.message);
  }
}

// 运行测试
if (require.main === module) {
  console.log("Testing Zhipu JWT token generation...");
  console.log("Please replace 'your_id.your_secret' with your actual API key");
  testTokenGeneration();
} 