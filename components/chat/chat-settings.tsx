"use client"

import { ChatbotUIContext } from "@/context/context"
import { IconSettings } from "@tabler/icons-react"
import { useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"

export function ChatSettings() {
  const {
    modelsLoaded,
    modelsLoading,
    loadModelsIfNeeded,
    availableHostedModels,
    availableLocalModels
  } = useContext(ChatbotUIContext)

  const [isOpen, setIsOpen] = useState(false)

  // 当用户打开设置时才加载模型，实现真正的懒加载
  useEffect(() => {
    if (isOpen && !modelsLoaded && !modelsLoading) {
      loadModelsIfNeeded()
    }
  }, [isOpen, modelsLoaded, modelsLoading, loadModelsIfNeeded])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconSettings size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>
            Configure your chat preferences and model selection.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Available Models</h3>
            {modelsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-muted-foreground text-sm">
                  Loading models...
                </span>
              </div>
            ) : modelsLoaded ? (
              <div className="space-y-2">
                {availableHostedModels.length > 0 && (
                  <div>
                    <h4 className="text-muted-foreground text-xs font-medium">
                      Hosted Models ({availableHostedModels.length})
                    </h4>
                    <div className="text-sm">
                      {availableHostedModels.map(m => m.modelName).join(", ")}
                    </div>
                  </div>
                )}
                {availableLocalModels.length > 0 && (
                  <div>
                    <h4 className="text-muted-foreground text-xs font-medium">
                      Local Models ({availableLocalModels.length})
                    </h4>
                    <div className="text-sm">
                      {availableLocalModels.map(m => m.modelName).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Models will load when needed
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
