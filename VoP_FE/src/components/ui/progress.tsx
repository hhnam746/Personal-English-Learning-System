'use client'

import * as React from 'react'
import { cn } from 'cn'
import { Progress as ProgressPrimitive } from '@animate-ui/react/primitives/radix-ui'

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full origin-left bg-primary"
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        style={{ transform: `scaleX(${(value ?? 0) / (props.max ?? 100)})` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
