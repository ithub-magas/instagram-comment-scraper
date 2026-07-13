'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Crown, Sparkles, RotateCcw, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import { formatDate, type Comment } from '@/lib/comments'

type Phase = 'idle' | 'spinning' | 'done'

export function WinnerRandomizer({ participants }: { participants: Comment[] }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const [winner, setWinner] = useState<Comment | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const names = participants

  const clear = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = null
  }, [])

  useEffect(() => () => clear(), [clear])

  const spin = useCallback(() => {
    if (names.length === 0) return
    clear()
    setWinner(null)
    setPhase('spinning')

    const len = names.length
    const winnerIndex = Math.floor(Math.random() * len)
    // Two bounded phases keep the animation ~4s regardless of list size.
    let fastLeft = 32 + Math.floor(Math.random() * 12) // fast spins
    const decelSteps = 16 // slowing steps that land exactly on the winner
    const decelStart = ((winnerIndex - (decelSteps - 1)) % len + len) % len
    let k = 0
    let current = index
    let delay = 40

    const step = () => {
      if (fastLeft > 0) {
        current = (current + 1) % len
        setIndex(current)
        fastLeft--
        timeout.current = setTimeout(step, delay)
        return
      }
      // deceleration phase: walk toward the winner while slowing down
      const idx = (decelStart + k) % len
      setIndex(idx)
      if (k >= decelSteps - 1) {
        setWinner(names[winnerIndex])
        setPhase('done')
        return
      }
      k++
      delay *= 1.16
      timeout.current = setTimeout(step, delay)
    }

    timeout.current = setTimeout(step, delay)
  }, [names, index, clear])

  const reset = useCallback(() => {
    clear()
    setWinner(null)
    setPhase('idle')
  }, [clear])

  if (names.length === 0) return null

  const len = names.length
  const at = (offset: number) => names[(((index + offset) % len) + len) % len]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
      {phase === 'done' && <Confetti />}

      {/* glow backdrop */}
      <div className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center sm:py-12">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
          Рандомайзер победителя
        </div>

        {phase !== 'done' && (
          <div className="relative w-full max-w-md">
            {/* reel window */}
            <div className="relative h-44 overflow-hidden rounded-2xl border border-border bg-background/60">
              {/* selector line */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-14 -translate-y-1/2 rounded-lg border border-primary/50 bg-primary/5" />
              {/* fade edges */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-background to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-background to-transparent" />

              <div className="flex h-full flex-col items-center justify-center">
                {[-1, 0, 1].map((offset) => {
                  const c = at(offset)
                  const isCenter = offset === 0
                  return (
                    <div
                      key={offset}
                      className={`flex h-14 items-center justify-center px-4 ${
                        isCenter
                          ? 'text-2xl font-bold text-primary'
                          : 'text-base text-muted-foreground/50'
                      }`}
                    >
                      <span className="max-w-[16rem] truncate">@{c.username}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && winner && (
          <div className="animate-float-up w-full max-w-md">
            <div
              className="flex flex-col items-center gap-4 rounded-2xl border border-primary/40 bg-primary/5 px-6 py-8"
              style={{ animation: 'glow-pulse 2.4s ease-in-out infinite' }}
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Crown className="size-8" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Победитель
              </p>
              <p className="break-all font-display text-4xl tracking-wide text-primary sm:text-5xl">
                @{winner.username}
              </p>
              {winner.text && (
                <p className="line-clamp-3 max-w-sm text-pretty text-sm text-muted-foreground">
                  «{winner.text}»
                </p>
              )}
              <p className="font-mono text-xs text-muted-foreground/70">{formatDate(winner)}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {phase !== 'done' ? (
            <Button
              size="lg"
              onClick={spin}
              disabled={phase === 'spinning'}
              className="gap-2"
            >
              <Play className="size-4" aria-hidden="true" />
              {phase === 'spinning' ? 'Выбираем…' : 'Выбрать победителя'}
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={spin} className="gap-2">
                <RotateCcw className="size-4" aria-hidden="true" />
                Разыграть снова
              </Button>
              <Button size="lg" variant="secondary" onClick={reset}>
                Сброс
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Участвует {len.toLocaleString('ru-RU')} уникальных участников
        </p>
      </div>
    </section>
  )
}
