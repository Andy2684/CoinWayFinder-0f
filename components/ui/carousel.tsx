'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: React.ReactNode
  className?: string
}

export function Carousel({ children, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel()

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
