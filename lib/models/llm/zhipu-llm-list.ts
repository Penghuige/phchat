import { LLM } from "@/types"

const ZHIPU_PLATFORM_LINK = "https://open.bigmodel.cn/"

// Zhipu Models -----------------------------
const GLM4: LLM = {
  modelId: "glm-4-plus",
  modelName: "GLM-4 Plus",
  provider: "zhipu",
  hostedId: "glm-4-plus",
  platformLink: ZHIPU_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "CNY",
    unit: "1M tokens",
    inputCost: 0.1,
    outputCost: 0.1
  }
}

const GLM4V: LLM = {
  modelId: "glm-4v-plus-0111",
  modelName: "GLM-4V Plus 0111",
  provider: "zhipu",
  hostedId: "glm-4v-plus-0111",
  platformLink: ZHIPU_PLATFORM_LINK,
  imageInput: true,
  pricing: {
    currency: "CNY",
    unit: "1M tokens",
    inputCost: 0.1,
    outputCost: 0.1
  }
}

export const ZHIPU_LLM_LIST: LLM[] = [GLM4, GLM4V]
