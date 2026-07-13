'use client'

import { useMemo, useState } from 'react'
import { Trophy, Users, MessageSquare, RefreshCw } from 'lucide-react'
import { LoadingScreen } from '@/components/loading-screen'
import { FileUpload } from '@/components/file-upload'
import { WinnerRandomizer } from '@/components/winner-randomizer'
import { CommentsList } from '@/components/comments-list'
import { PoweredBy } from '@/components/powered-by'
import { Button } from '@/components/ui/button'
import { dedupeByUsername, type ParsedResult } from '@/lib/comments'

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ParsedResult | null>(null)

  const unique = useMemo(
    () => (data ? dedupeByUsername(data.comments) : []),
    [data],
  )

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />
  }

  if (!data) {
    return <FileUpload onLoaded={setData} />
  }

  const stats = [
    { label: 'Всего комментариев', value: data.comments.length, icon: MessageSquare },
    { label: 'Уникальных участников', value: unique.length, icon: Users },
    { label: 'Дубликатов убрано', value: data.comments.length - unique.length, icon: Trophy },
  ]

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text font-display text-4xl tracking-wide text-transparent sm:text-5xl">
            МОКСУ КОНКУРС
          </h1>
          {data.shortcode && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">#{data.shortcode}</p>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => setData(null)}
          className="gap-2 self-start"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Другой файл
        </Button>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <s.icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-3xl leading-none text-foreground">
                {s.value.toLocaleString('ru-RU')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <WinnerRandomizer participants={unique} />
      </div>

      <CommentsList comments={unique} />

      <footer className="mt-16 border-t border-border pt-8">
        <PoweredBy />
      </footer>
    </main>
  )
}
