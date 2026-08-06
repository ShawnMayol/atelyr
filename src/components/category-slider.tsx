"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Category } from "@/types/database"
import { slugify } from "@/lib/utils"

type CategorySliderProps = {
  categories?: Category[]
}

export default function CategorySlider({ categories = [] }: CategorySliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const isMouseDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftState = useRef(0)
  const velocity = useRef(0)
  const lastX = useRef(0)
  const animFrameId = useRef<number | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Cancel momentum animation on unmount or new interaction
  const stopMomentum = () => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current)
      animFrameId.current = null
    }
  }

  useEffect(() => {
    setMounted(true)
    return () => stopMomentum()
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    stopMomentum()

    isMouseDown.current = true
    setHasDragged(false)
    startX.current = e.pageX - sliderRef.current.offsetLeft
    scrollLeftState.current = sliderRef.current.scrollLeft
    lastX.current = e.pageX
    velocity.current = 0
  }

  const startInertia = () => {
    isMouseDown.current = false
    if (Math.abs(velocity.current) < 1 || !sliderRef.current) return

    const step = () => {
      if (!sliderRef.current) return
      sliderRef.current.scrollLeft -= velocity.current
      velocity.current *= 0.93 // Deceleration friction

      if (Math.abs(velocity.current) > 0.5) {
        animFrameId.current = requestAnimationFrame(step)
      } else {
        stopMomentum()
      }
    }

    animFrameId.current = requestAnimationFrame(step)
  }

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      startInertia()
    }
  }

  const handleMouseUp = () => {
    if (isMouseDown.current) {
      startInertia()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !sliderRef.current) return
    e.preventDefault()

    const x = e.pageX - sliderRef.current.offsetLeft
    const deltaX = e.pageX - lastX.current
    velocity.current = deltaX // Track velocity for momentum spin

    const walk = (x - startX.current) * 1.2
    if (Math.abs(walk) > 4) {
      setHasDragged(true)
    }

    sliderRef.current.scrollLeft = scrollLeftState.current - walk
    lastX.current = e.pageX
  }

  if (!categories || categories.length === 0) return null

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="flex gap-2 sm:gap-3 overflow-x-auto select-none py-2 px-6 lg:px-12 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [ms-overflow-style:none] [scrollbar-width:none] touch-pan-x"
    >
      {categories.map((category) => (
        <div
          key={category.id}
          className="w-[200px] sm:w-[240px] md:w-[270px] flex-shrink-0 select-none"
        >
          <Link
            href={`/${slugify(category.name)}`}
            onClick={(e) => {
              if (hasDragged) e.preventDefault()
            }}
            draggable={false}
            className="group block text-center select-none"
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-champagne rounded-xs relative select-none pointer-events-none">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  width={500}
                  height={625}
                  draggable={false}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-champagne text-forest/30 text-xs uppercase tracking-wider font-semibold p-4 select-none">
                  {category.name}
                </div>
              )}
            </div>
            <span className="mt-3 block text-xs font-semibold tracking-[0.18em] uppercase text-forest/90 transition-colors group-hover:text-forest select-none pointer-events-none">
              {category.name}
            </span>
          </Link>
        </div>
      ))}
    </div>
  )
}
