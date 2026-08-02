"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type AccordionItemProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("border-b border-forest/15 py-4", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.2em] text-forest/90 transition-colors hover:text-forest cursor-pointer"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-forest/50 transition-transform duration-300",
            isOpen && "rotate-180 text-forest"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-3.5 text-xs leading-relaxed text-forest/70 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
