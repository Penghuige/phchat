// 注释掉bundle分析器和PWA，减少开发和生产环境的开销
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true"
// })

// const withPWA = require("next-pwa")({
//   dest: "public"
// })

// 简化的配置，去除不必要的功能
module.exports = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost"
        },
        {
          protocol: "http",
          hostname: "127.0.0.1"
        },
        {
          protocol: "https",
          hostname: "**"
        }
      ]
    },
    experimental: {
      serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
    }
}

// 如果需要分析bundle大小，使用以下命令：
// ANALYZE=true npm run build
// 如果需要PWA功能，可以重新启用上面的配置
