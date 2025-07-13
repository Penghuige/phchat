// 智谱AI JWT Token生成工具
// 参考：https://jwt.io/introduction

interface JWTHeader {
  alg: string
  sign_type: string
}

interface JWTPayload {
  api_key: string
  exp: number
  timestamp: number
}

export async function generateZhipuToken(apiKey: string): Promise<string> {
  // 解析API key格式：{id}.{secret}
  const [id, secret] = apiKey.split(".")

  if (!id || !secret) {
    throw new Error(
      "Invalid Zhipu API key format. Expected format: {id}.{secret}"
    )
  }

  const header: JWTHeader = {
    alg: "HS256",
    sign_type: "SIGN"
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: JWTPayload = {
    api_key: id,
    exp: now + 3600, // 1小时后过期
    timestamp: now
  }

  // Base64URL编码header和payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  // 创建签名
  const signature = await createHMACSHA256(
    `${encodedHeader}.${encodedPayload}`,
    secret
  )

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Base64URL编码（JWT标准）
function base64UrlEncode(str: string): string {
  const base64 = btoa(str)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// 创建HMAC-SHA256签名
async function createHMACSHA256(
  message: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  // 导入密钥
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  // 创建签名
  const signature = await crypto.subtle.sign("HMAC", key, messageData)

  // 转换为Base64URL
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

// 验证token是否有效
export function validateZhipuToken(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return false
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    return payload.exp > now
  } catch {
    return false
  }
}

// Base64URL解码
function base64UrlDecode(str: string): string {
  // 添加填充
  while (str.length % 4) {
    str += "="
  }

  // 替换URL安全字符
  str = str.replace(/-/g, "+").replace(/_/g, "/")

  return atob(str)
}
