'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, type Comment } from '@/lib/comments'

const PER_PAGE = 100

function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return `oklch(0.6 0.14 ${h})`
}

export function CommentsList({ comments }: { comments: Comment[] }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return comments
    return comments.filter(
      (c) => c.username.toLowerCase().includes(q) || c.text.toLowerCase().includes(q),
    )
  }, [comments, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PER_PAGE
  const pageItems = filtered.slice(start, start + PER_PAGE)

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 font-display text-3xl tracking-wide text-foreground">
          <MessageCircle className="size-6 text-primary" aria-hidden="true" />
          Комментарии
        </h2>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Поиск по нику или тексту…"
            className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 sm:w-72"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Показаны{' '}
        <span className="font-medium text-foreground">
          {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PER_PAGE, filtered.length)}
        </span>{' '}
        из <span className="font-medium text-foreground">{filtered.length.toLocaleString('ru-RU')}</span>
      </p>

      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
          Ничего не найдено
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pageItems.map((c, i) => (
            <li
              key={`${c.username}-${start + i}`}
              className="flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: avatarColor(c.username) }}
                aria-hidden="true"
              >
                {c.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-foreground">@{c.username}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatDate(c)}
                  </span>
                </div>
                {c.text && (
                  <p className="mt-1 break-words text-pretty text-sm text-muted-foreground">
                    {c.text}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            Стр. <span className="font-medium text-foreground">{safePage}</span> / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Следующая страница"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  )
}
