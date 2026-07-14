'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Medal, Search, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buildCommentRanking, type Comment } from '@/lib/comments'
import { cn } from '@/lib/utils'

const INITIAL_LIMIT = 20

function initials(username: string): string {
  return username.charAt(0).toUpperCase()
}

function placeLabel(place: number): string {
  return `${place}-е место`
}

export function CommentRanking({ comments }: { comments: Comment[] }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const ranking = useMemo(
    () => buildCommentRanking(comments).map((entry, index) => ({ ...entry, place: index + 1 })),
    [comments],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().replace(/^@+/, '').toLocaleLowerCase('ru-RU')
    if (!normalizedQuery) return ranking
    return ranking.filter((entry) => entry.normalizedUsername.includes(normalizedQuery))
  }, [query, ranking])

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hiddenCount = Math.max(0, filtered.length - INITIAL_LIMIT)

  return (
    <section aria-labelledby="ranking-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-primary" aria-hidden="true" />
            <h2 id="ranking-title" className="font-display text-3xl tracking-wide text-foreground">
              Рейтинг активности
            </h2>
          </div>
          <p className="text-pretty text-sm text-muted-foreground">
            Учитываются все комментарии из загруженного файла, независимо от фильтров розыгрыша.
          </p>
        </div>

        <label className="relative block sm:w-72">
          <span className="sr-only">Поиск пользователя по нику</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setExpanded(false)
            }}
            placeholder="Найти пользователя…"
            className="pl-9"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Users className="size-4 text-primary" aria-hidden="true" />
        <span>
          Всего авторов: <strong className="font-medium text-foreground">{ranking.length.toLocaleString('ru-RU')}</strong>
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <Search className="size-7 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">Пользователь не найден</p>
            <p className="text-sm text-muted-foreground">Попробуйте изменить ник в строке поиска.</p>
          </div>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {visible.map((entry) => {
            const isTopThree = entry.place <= 3

            return (
              <li
                key={entry.normalizedUsername}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 sm:p-4"
              >
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    isTopThree
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground',
                  )}
                  aria-label={placeLabel(entry.place)}
                >
                  {isTopThree ? (
                    <Medal className="size-5" aria-hidden="true" />
                  ) : (
                    <span className="font-mono text-sm font-semibold">{entry.place}</span>
                  )}
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary" aria-hidden="true">
                  {initials(entry.username)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">@{entry.username}</p>
                  <p className="text-xs text-muted-foreground">{placeLabel(entry.place)}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl leading-none text-foreground">
                    {entry.commentCount.toLocaleString('ru-RU')}
                  </p>
                  <p className="text-xs text-muted-foreground">комментариев</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {filtered.length > INITIAL_LIMIT && (
        <Button variant="secondary" className="self-center" onClick={() => setExpanded((value) => !value)}>
          {expanded ? (
            <ChevronUp data-icon="inline-start" aria-hidden="true" />
          ) : (
            <ChevronDown data-icon="inline-start" aria-hidden="true" />
          )}
          {expanded ? 'Свернуть рейтинг' : `Показать ещё ${hiddenCount.toLocaleString('ru-RU')}`}
        </Button>
      )}
    </section>
  )
}
