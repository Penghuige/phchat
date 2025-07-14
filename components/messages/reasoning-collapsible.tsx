import { cn } from "@/lib/utils"
import {
  IconBrain,
  IconCaretDownFilled,
  IconCaretRightFilled
} from "@tabler/icons-react"
import { FC, useState, useRef, useEffect } from "react"

interface ReasoningCollapsibleProps {
  reasoningContent: string
  className?: string
}

export const ReasoningCollapsible: FC<ReasoningCollapsibleProps> = ({
  reasoningContent,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true) // 默认展开
  const [contentHeight, setContentHeight] = useState<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // 计算内容高度
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [reasoningContent])

  if (!reasoningContent || reasoningContent.trim() === "") {
    return null
  }

  return (
    <div className={cn("my-4", className)}>
      {/* 思考过程这个标题组件不要为一整行*/}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 flex cursor-pointer items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
      >
        <IconBrain className="text-gray-600" size={16} />
        <span className="text-sm font-medium text-gray-700">思考过程</span>
        <div
          className={cn(
            "ml-auto transition-transform duration-300",
            isExpanded ? "rotate-0" : "-rotate-90"
          )}
        >
          <IconCaretDownFilled className="text-gray-600" size={14} />
        </div>
      </button>

      {/* 内容这里直接输出透明背景的文字即可，不要有边框*/}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div
          ref={contentRef}
          className="rounded-b-md border-l-4 border-gray-300 pl-4"
        >
          <div className="prose prose-sm max-w-none text-gray-700">
            <pre className="m-0 whitespace-pre-wrap bg-transparent font-sans text-sm leading-relaxed">
              {reasoningContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
