'use client'

import { useEffect, useState } from 'react'
import { PoweredBy } from './powered-by'

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 2600
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(onDone, 350)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* ambient rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="size-[520px] rounded-full border border-primary/10"
          style={{ animation: 'spin-slow 18s linear infinite' }}
        />
        <div
          className="absolute size-[360px] rounded-full border border-accent/10"
          style={{ animation: 'spin-slow 12s linear infinite reverse' }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        {/* spinning emblem */}
        <div className="relative flex size-28 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/40"
            style={{ animation: 'spin-slow 1s linear infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent border-l-accent/40"
            style={{ animation: 'spin-slow 1.4s linear infinite reverse' }}
          />
          <span className="font-display text-3xl leading-none text-primary">AK</span>
        </div>

        <div className="space-y-2">
          <h1 className="bg-gradient-to-r from-primary via-foreground to-primary bg-[length:200%_auto] bg-clip-text font-display text-5xl tracking-wide text-transparent sm:text-6xl"
            style={{ animation: 'shimmer 3s linear infinite' }}
          >
            МОКСУ КОНКУРС
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Розыгрыш победителя
          </p>
        </div>

        {/* progress */}
        <div className="w-64 max-w-[80vw]">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-xs text-muted-foreground">{progress}%</p>
        </div>
      </div>

      <div className="absolute bottom-8">
        <PoweredBy />
      </div>
    </div>
  )
}
