import { LLM } from "@/types"

const DEEPSEEK_PLATFORM_LINK = "https://platform.deepseek.com/"

// DeepSeek Models -----------------------------
const DeepSeekV3: LLM = {
  modelId: "deepseek-chat",
  modelName: "DeepSeek-V3-0324",
  provider: "deepseek",
  hostedId: "DeepSeek-V3-0324",
  platformLink: DEEPSEEK_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.07,
    outputCost: 1.1
  }
}

const DeepSeekR1: LLM = {
  modelId: "deepseek-reasoner",
  modelName: "DeepSeek-R1-0528",
  provider: "deepseek",
  hostedId: "DeepSeek-R1-0528",
  platformLink: DEEPSEEK_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.14,
    outputCost: 2.19
  }
}

export const DEEPSEEK_LLM_LIST: LLM[] = [DeepSeekV3, DeepSeekR1]
