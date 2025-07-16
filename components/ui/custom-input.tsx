'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils' // если ты используешь clsx или cn для классов

// 👇 Типы HTML input + дополнительные пропсы
type CustomInputProps = React.InputHTMLAttributes<HTMLInputElement>

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} className={cn('border px-2 py-1 rounded text-sm', className)} {...props} />
    )
  }
)

CustomInput.displayName = 'CustomInput'

export default CustomInput
