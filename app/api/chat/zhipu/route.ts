import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { ServerRuntime } from "next"
import { generateZhipuToken } from "@/lib/zhipu-token"

export const runtime: ServerRuntime = "edge"

interface ZhipuMessage {
  role: "user" | "assistant" | "system"
  content:
    | string
    | Array<{
        type: "text" | "image_url"
        text?: string
        image_url?: {
          url: string
        }
      }>
}

interface ZhipuRequest {
  model: string
  messages: ZhipuMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface ZhipuResponse {
  id: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string
      role?: string
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 智谱AI的实际响应格式
interface ZhipuStreamResponse {
  content?: string
  role?: string
  finish_reason?: string
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.zhipu_api_key, "Zhipu")

    // 转换消息格式
    const zhipuMessages: ZhipuMessage[] = messages.map((msg: any) => {
      if (
        msg.role === "user" &&
        msg.content &&
        typeof msg.content === "string"
      ) {
        // 检查是否包含图片URL
        const imageUrlMatch = msg.content.match(/!\[.*?\]\((.*?)\)/)
        if (imageUrlMatch) {
          return {
            role: "user",
            content: [
              {
                type: "text" as const,
                text: msg.content.replace(/!\[.*?\]\(.*?\)/, "")
              },
              {
                type: "image_url" as const,
                image_url: {
                  url: imageUrlMatch[1]
                }
              }
            ]
          }
        }
      }

      return {
        role: msg.role,
        content: msg.content
      }
    })

    const zhipuRequest: ZhipuRequest = {
      model: chatSettings.model,
      messages: zhipuMessages,
      temperature: chatSettings.temperature,
      stream: true
    }

    // 生成JWT token
    const token = await generateZhipuToken(profile.zhipu_api_key || "")

    console.log("Generated token:", token.substring(0, 50) + "...")

    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(zhipuRequest)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Zhipu API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage =
          errorData.error?.message || errorData.message || errorMessage
      } catch (e) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                //console.log("Raw data from Zhipu:", data)

                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                try {
                  // 解析智谱AI的响应格式（标准OpenAI格式）
                  const parsed = JSON.parse(data)
                  //console.log("Parsed response:", parsed)

                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content
                    // 输出content，有点吵关了
                    //console.log("//Sending content:", content)
                    controller.enqueue(new TextEncoder().encode(content))
                  } else if (
                    parsed.choices &&
                    parsed.choices[0]?.finish_reason
                  ) {
                    // 流结束
                    //console.log("Stream finished")
                    controller.close()
                    return
                  }
                } catch (e) {
                  console.log("Failed to parse response:", data, e)
                }
              }
            }
          }
        } catch (error) {
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Zhipu API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Zhipu API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
