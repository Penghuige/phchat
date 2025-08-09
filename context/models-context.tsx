import { LLM, OpenRouterLLM } from "@/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { Dispatch, SetStateAction, createContext } from "react"

interface ModelsContext {
  // MODELS STORE
  envKeyMap: Record<string, VALID_ENV_KEYS>
  setEnvKeyMap: Dispatch<SetStateAction<Record<string, VALID_ENV_KEYS>>>
  availableHostedModels: LLM[]
  setAvailableHostedModels: Dispatch<SetStateAction<LLM[]>>
  availableLocalModels: LLM[]
  setAvailableLocalModels: Dispatch<SetStateAction<LLM[]>>
  availableOpenRouterModels: OpenRouterLLM[]
  setAvailableOpenRouterModels: Dispatch<SetStateAction<OpenRouterLLM[]>>
  // 模型加载状态和函数
  modelsLoaded: boolean
  modelsLoading: boolean
  loadModelsIfNeeded: () => Promise<void>
}

export const ModelsContext = createContext<ModelsContext>({
  // MODELS STORE
  envKeyMap: {},
  setEnvKeyMap: () => {},
  availableHostedModels: [],
  setAvailableHostedModels: () => {},
  availableLocalModels: [],
  setAvailableLocalModels: () => {},
  availableOpenRouterModels: [],
  setAvailableOpenRouterModels: () => {},
  // 模型加载状态和函数
  modelsLoaded: false,
  modelsLoading: false,
  loadModelsIfNeeded: async () => {}
})
