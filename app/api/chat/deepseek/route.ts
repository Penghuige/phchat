import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "edge"

interface DeepSeekMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: Array<{
    type: string
    function: {
      name: string
      description: string
      parameters: {
        type: string
        properties: Record<string, any>
        required: string[]
      }
    }
  }>
}

interface DeepSeekResponse {
  id: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string | null
      reasoning_content?: string | null
      role?: string
      tool_calls?: Array<{
        id: string
        type: string
        function: {
          name: string
          arguments: string
        }
      }>
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.deepseek_api_key, "DeepSeek")

    // 转换消息格式
    const deepseekMessages: DeepSeekMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    const deepseekRequest: DeepSeekRequest = {
      model: chatSettings.model,
      messages: deepseekMessages,
      temperature: chatSettings.temperature,
      stream: true
      // 移除强制工具调用，让模型自然响应
    }

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profile.deepseek_api_key}`
        },
        body: JSON.stringify(deepseekRequest)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepSeek API Error:", {
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

        let hasShownReasoning = false
        let hasShownAnswer = false

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)

                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                try {
                  const parsed: DeepSeekResponse = JSON.parse(data)

                  // 处理思考过程
                  if (
                    parsed.choices &&
                    parsed.choices[0]?.delta?.reasoning_content !== undefined
                  ) {
                    const reasoningContent =
                      parsed.choices[0].delta.reasoning_content
                    if (reasoningContent) {
                      // 如果是第一个思考过程块，添加标题
                      if (!hasShownReasoning) {
                        controller.enqueue(
                          new TextEncoder().encode("**思考过程：**\n")
                        )
                        hasShownReasoning = true
                      }
                      controller.enqueue(
                        new TextEncoder().encode(reasoningContent)
                      )
                    }
                  }

                  // 处理响应内容
                  if (
                    parsed.choices &&
                    parsed.choices[0]?.delta?.content !== undefined
                  ) {
                    const content = parsed.choices[0].delta.content
                    if (content) {
                      // 如果之前显示了思考过程，添加答案标题
                      if (hasShownReasoning && !hasShownAnswer) {
                        controller.enqueue(
                          new TextEncoder().encode("\n\n**答案：**\n")
                        )
                        hasShownAnswer = true
                      }
                      controller.enqueue(new TextEncoder().encode(content))
                    }
                  }

                  if (parsed.choices && parsed.choices[0]?.finish_reason) {
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

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "DeepSeek API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "DeepSeek API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
