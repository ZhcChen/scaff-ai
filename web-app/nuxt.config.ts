export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    port: 7102,
  },

  modules: [],

  runtimeConfig: {
    // 私有配置（仅服务端可用）
    apiSecret: "",
    // 公开配置
    public: {
      apiBase: "http://localhost:7100/api",
    },
  },

  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:7100/api",
        changeOrigin: true,
      },
    },
  },

  compatibilityDate: "2025-01-03",
});
