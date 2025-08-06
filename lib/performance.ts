// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)

      // 如果耗时超过1秒，记录警告
      if (duration > 1000) {
        console.warn(
          `Performance warning: ${name} took ${duration.toFixed(2)}ms`
        )
      }
    }
  }

  recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name)
    if (!times || times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }

  getMetrics(): Record<string, { avg: number; count: number; max: number }> {
    const result: Record<string, { avg: number; count: number; max: number }> =
      {}

    for (const [name, times] of this.metrics.entries()) {
      result[name] = {
        avg: this.getAverageTime(name),
        count: times.length,
        max: Math.max(...times)
      }
    }

    return result
  }

  clear() {
    this.metrics.clear()
  }
}

// 便捷函数
export const perf = PerformanceMonitor.getInstance()

// React Hook for performance monitoring
export const usePerformanceMonitor = (name: string) => {
  return {
    startTimer: () => perf.startTimer(name),
    recordMetric: (duration: number) => perf.recordMetric(name, duration)
  }
}
