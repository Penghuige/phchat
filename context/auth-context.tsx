import { Tables } from "@/supabase/types"
import { Dispatch, SetStateAction, createContext } from "react"

interface AuthContext {
  // PROFILE STORE
  profile: Tables<"profiles"> | null
  setProfile: Dispatch<SetStateAction<Tables<"profiles"> | null>>
}

export const AuthContext = createContext<AuthContext>({
  // PROFILE STORE
  profile: null,
  setProfile: () => {}
})
