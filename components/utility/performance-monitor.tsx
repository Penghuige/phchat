"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number | null
  renderCount: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: null,
    renderCount: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 记录页面加载时间
    const loadTime = performance.now()

    // 获取内存使用情况（仅在支持的浏览器中）
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || null

    setMetrics(prev => ({
      ...prev,
      loadTime,
      memoryUsage,
      renderCount: prev.renderCount + 1
    }))

    // 开发环境下显示性能监控
    if (process.env.NODE_ENV === "development") {
      // 延迟显示，避免影响初始加载
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // 格式化字节数
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!isVisible || process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded bg-black/80 p-2 font-mono text-xs text-white">
      <div>Load: {metrics.loadTime.toFixed(2)}ms</div>
      {metrics.memoryUsage && (
        <div>Memory: {formatBytes(metrics.memoryUsage)}</div>
      )}
      <div>Renders: {metrics.renderCount}</div>
      <button
        onClick={() => setIsVisible(false)}
        className="mt-1 text-xs underline"
      >
        Hide
      </button>
    </div>
  )
}
