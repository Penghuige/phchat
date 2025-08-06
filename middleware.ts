import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"

// 改进的内存缓存，包含清理机制
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10分钟
const MAX_CACHE_SIZE = 100 // 限制缓存大小

// 清理过期缓存
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
  // 如果缓存太大，删除最旧的条目
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2))
    toDelete.forEach(([key]) => cache.delete(key))
  }
}

export async function middleware(request: NextRequest) {
  const i18nResult = i18nRouter(request, i18nConfig)
  if (i18nResult) return i18nResult

  try {
    const { supabase, response } = createClient(request)

    // 只对根路径进行重定向逻辑
    if (request.nextUrl.pathname === "/") {
      // 定期清理缓存
      if (Math.random() < 0.1) { // 10%的概率清理缓存
        cleanupCache()
      }

      console.time('middleware-getSession');
      const session = await supabase.auth.getSession()
      console.timeEnd('middleware-getSession');

      const redirectToChat = session && request.nextUrl.pathname === "/"

      if (redirectToChat) {
        const userId = session.data.session?.user.id
        const cacheKey = `home-workspace-${userId}`
        const cached = cache.get(cacheKey)
        
        let homeWorkspace
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          homeWorkspace = cached.data
          console.log('Cache hit for home workspace')
        } else {
          console.time('middleware-getHomeWorkspace');
          const { data, error } = await supabase
            .from("workspaces")
            .select("id") // 只选择需要的字段
            .eq("user_id", userId)
            .eq("is_home", true)
            .single()
          console.timeEnd('middleware-getHomeWorkspace');

          if (error) {
            console.error('Error fetching home workspace:', error)
            // 不抛出错误，继续使用默认行为
            return response
          }
          
          homeWorkspace = data
          cache.set(cacheKey, { data: homeWorkspace, timestamp: Date.now() })
          console.log('Cache miss, stored home workspace')
        }

        if (homeWorkspace?.id) {
        return NextResponse.redirect(
          new URL(`/${homeWorkspace.id}/chat`, request.url)
        )
        }
      }
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)
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
