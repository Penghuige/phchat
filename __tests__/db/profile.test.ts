import { getProfileByUserId, createProfile } from "@/db/profile"
import { supabase } from "@/lib/supabase/browser-client"

// Mock supabase
jest.mock("@/lib/supabase/browser-client", () => ({
  supabase: {
    from: jest.fn()
  }
}))

describe("getProfileByUserId", () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return profile when it exists", async () => {
    const mockProfile = {
      id: "test-id",
      user_id: "test-user-id",
      username: "testuser",
      display_name: "Test User",
      bio: "Test bio",
      has_onboarded: false,
      image_url: "",
      image_path: "",
      profile_context: "",
      use_azure_openai: false,
      created_at: new Date().toISOString(),
      updated_at: null
    }

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      })
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect
    } as any)

    const result = await getProfileByUserId("test-user-id")

    expect(result).toEqual(mockProfile)
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles")
  })

  it("should create default profile when profile doesn't exist", async () => {
    const mockError = {
      code: "PGRST116",
      message: "No rows returned"
    }

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })
    })

    const mockCreatedProfile = {
      id: "new-id",
      user_id: "test-user-id",
      username: "user123456789",
      display_name: "",
      bio: "",
      has_onboarded: false,
      image_url: "",
      image_path: "",
      profile_context: "",
      use_azure_openai: false,
      created_at: new Date().toISOString(),
      updated_at: null
    }

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCreatedProfile,
            error: null
          })
        })
      })
    } as any)

    // Mock Math.random to return a predictable value
    const originalRandom = Math.random
    Math.random = jest.fn().mockReturnValue(0.123456789)

    const result = await getProfileByUserId("test-user-id")

    expect(result).toEqual(mockCreatedProfile)
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles")
    
    // Restore Math.random
    Math.random = originalRandom
  })

  it("should throw error for other database errors", async () => {
    const mockError = {
      code: "OTHER_ERROR",
      message: "Some other error"
    }

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect
    } as any)

    await expect(getProfileByUserId("test-user-id")).rejects.toThrow("Some other error")
  })
}) 