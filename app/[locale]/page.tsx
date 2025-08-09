"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
// 移除主题hook，改用CSS变量
// import { useTheme } from "next-themes"
import Link from "next/link"

export default function HomePage() {
  // 移除主题获取，减少JavaScript执行
  // const { theme } = useTheme()

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        {/* 使用CSS变量自动适应主题，避免JavaScript计算 */}
        <ChatbotUISVG theme="dark" scale={0.3} />
      </div>

      <div className="mt-2 text-4xl font-bold">Chatbot UI</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold transition-colors hover:bg-blue-600"
        href="/login"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
