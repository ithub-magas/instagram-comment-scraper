'use client'

import { useCallback, useEffect, useState } from 'react'
import { Crown, Sparkles, RotateCcw, Play, ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import { FunnelVortex } from './funnel-vortex'
import { formatDate, type Comment, type ParticipantMode } from '@/lib/comments'

type Phase = 'idle' | 'spinning' | 'done'

type WinnerRandomizerProps = {
  participants: Comment[]
  mode: ParticipantMode
}

export function WinnerRandomizer({ participants, mode }: WinnerRandomizerProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [winner, setWinner] = useState<Comment | null>(null)

  const names = participants

  useEffect(() => {
    setWinner(null)
    setPhase('idle')
  }, [participants])

  const spin = useCallback(() => {
    if (names.length === 0) return
    const w = names[Math.floor(Math.random() * names.length)]
    setWinner(w)
    setPhase('spinning')
  }, [names])

  const handleComplete = useCallback(() => {
    setPhase('done')
  }, [])

  const reset = useCallback(() => {
    setWinner(null)
    setPhase('idle')
  }, [])

  const len = names.length

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

        {phase === 'idle' && (
          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 sm:h-72">
            {len === 0 ? (
              <div className="flex max-w-xs flex-col items-center gap-3 text-muted-foreground">
                <ListFilter className="size-7 text-primary" aria-hidden="true" />
                <p className="text-pretty text-sm">
                  По текущим фильтрам нет участников. Измените настройки розыгрыша.
                </p>
              </div>
            ) : (
              <p className="max-w-xs text-pretty text-sm text-muted-foreground">
                Нажмите кнопку — все участники закружатся в воронке, и она вытянет одного победителя.
              </p>
            )}
          </div>
        )}

        {phase === 'spinning' && winner && (
          <FunnelVortex participants={names} winner={winner} onComplete={handleComplete} />
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
            <Button size="lg" onClick={spin} disabled={phase === 'spinning' || len === 0}>
              <Play data-icon="inline-start" aria-hidden="true" />
              {phase === 'spinning' ? 'Воронка крутится…' : 'Выбрать победителя'}
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
          {mode === 'unique'
            ? `${len.toLocaleString('ru-RU')} уникальных участников`
            : `${len.toLocaleString('ru-RU')} комментариев — каждый отдельный шанс`}
        </p>
      </div>
    </section>
  )
}
