import { Tables } from "@/supabase/types"
import { WorkspaceImage } from "@/types"
import { Dispatch, SetStateAction, createContext } from "react"

interface WorkspaceContext {
  // WORKSPACE STORE
  selectedWorkspace: Tables<"workspaces"> | null
  setSelectedWorkspace: Dispatch<SetStateAction<Tables<"workspaces"> | null>>
  workspaces: Tables<"workspaces">[]
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspaces">[]>>
  workspaceImages: WorkspaceImage[]
  setWorkspaceImages: Dispatch<SetStateAction<WorkspaceImage[]>>
  // 按需加载工作区图片
  loadWorkspaceImage: (
    workspace: Tables<"workspaces">
  ) => Promise<WorkspaceImage | null>
}

export const WorkspaceContext = createContext<WorkspaceContext>({
  // WORKSPACE STORE
  selectedWorkspace: null,
  setSelectedWorkspace: () => {},
  workspaces: [],
  setWorkspaces: () => {},
  workspaceImages: [],
  setWorkspaceImages: () => {},
  // 按需加载工作区图片
  loadWorkspaceImage: async () => null
})
