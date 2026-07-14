'use client'

import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, Users, MessageSquare, RefreshCw } from 'lucide-react'
import { LoadingScreen } from '@/components/loading-screen'
import { FileUpload } from '@/components/file-upload'
import { WinnerRandomizer } from '@/components/winner-randomizer'
import { CommentsList } from '@/components/comments-list'
import { SettingsPanel } from '@/components/settings-panel'
import { PoweredBy } from '@/components/powered-by'
import { Button } from '@/components/ui/button'
import {
  buildParticipantPool,
  dedupeByUsername,
  DEFAULT_DRAW_SETTINGS,
  type DrawSettings,
  type ParsedResult,
} from '@/lib/comments'

const SETTINGS_STORAGE_KEY = 'moksu-draw-settings-v1'

function isDrawSettings(value: unknown): value is DrawSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<DrawSettings>
  return (
    (settings.mode === 'unique' || settings.mode === 'all') &&
    typeof settings.keyword === 'string' &&
    typeof settings.excludedUsernames === 'string' &&
    typeof settings.excludeEmpty === 'boolean'
  )
}

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ParsedResult | null>(null)
  const [settings, setSettings] = useState<DrawSettings>(DEFAULT_DRAW_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (isDrawSettings(parsed)) setSettings(parsed)
      }
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings, settingsLoaded])

  const unique = useMemo(
    () => (data ? dedupeByUsername(data.comments) : []),
    [data],
  )

  const participantPool = useMemo(
    () => (data ? buildParticipantPool(data.comments, settings) : []),
    [data, settings],
  )

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />
  }

  if (!data) {
    return <FileUpload onLoaded={setData} />
  }

  const stats = [
    { label: 'Всего комментариев', value: data.comments.length, icon: MessageSquare },
    { label: 'Уникальных авторов', value: unique.length, icon: Users },
    { label: 'Допущено к розыгрышу', value: participantPool.length, icon: SlidersHorizontal },
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
        <div className="flex items-center gap-2 self-start">
          <SettingsPanel
            settings={settings}
            eligibleCount={participantPool.length}
            onChange={setSettings}
          />
          <Button variant="secondary" onClick={() => setData(null)}>
            <RefreshCw data-icon="inline-start" aria-hidden="true" />
            Другой файл
          </Button>
        </div>
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
        <WinnerRandomizer participants={participantPool} mode={settings.mode} />
      </div>

      <CommentsList comments={participantPool} />

      <footer className="mt-16 border-t border-border pt-8">
        <PoweredBy />
      </footer>
    </main>
  )
}
