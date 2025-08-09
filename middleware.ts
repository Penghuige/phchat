import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"

// 简单的内存缓存，避免重复查询
const workspaceCache = new Map<string, { workspaceId: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

export async function middleware(request: NextRequest) {
  // 优先处理国际化路由
  const i18nResult = i18nRouter(request, i18nConfig)
  if (i18nResult) return i18nResult

  try {
    const { supabase, response } = createClient(request)

    // 只在需要重定向时才查询session，减少数据库压力
    const isRootPath = request.nextUrl.pathname === "/"
    if (!isRootPath) {
      return response
    }

    const session = await supabase.auth.getSession()

    if (!session?.data?.session) {
      return response
    }

    const userId = session.data.session.user.id
    const now = Date.now()

    // 检查缓存
    const cached = workspaceCache.get(userId)
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.redirect(
        new URL(`/${cached.workspaceId}/chat`, request.url)
      )
    }

    // 只查询必要的字段，减少数据传输
      const { data: homeWorkspace, error } = await supabase
        .from("workspaces")
      .select("id") // 只选择需要的字段
      .eq("user_id", userId)
        .eq("is_home", true)
        .single()

      if (!homeWorkspace) {
      // 清除可能过期的缓存
      workspaceCache.delete(userId)
      throw new Error(error?.message || "No home workspace found")
      }

    // 更新缓存
    workspaceCache.set(userId, {
      workspaceId: homeWorkspace.id,
      timestamp: now
    })

      return NextResponse.redirect(
        new URL(`/${homeWorkspace.id}/chat`, request.url)
      )
  } catch (e) {
    // 发生错误时，允许继续正常的页面流程
    console.warn("Middleware error:", e)
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
