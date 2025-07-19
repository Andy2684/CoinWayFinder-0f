'use client'

import * as React from 'react'
import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

interface CarouselProps {
  children: React.ReactNode
  options?: KeenSliderPlugin
}

export function Carousel({ children, options }: CarouselProps) {
  const [ref] = useKeenSlider<HTMLDivElement>(options)
  return <div ref={ref} className="keen-slider">{children}</div>
}
