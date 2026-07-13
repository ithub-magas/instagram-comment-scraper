'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileJson, AlertCircle } from 'lucide-react'
import { parseCommentsJson, type ParsedResult } from '@/lib/comments'
import { Button } from '@/components/ui/button'
import { PoweredBy } from './powered-by'

function makeDemoData(): ParsedResult {
  const first = [
    'alex',
    'maria',
    'dmitry',
    'olga',
    'ivan',
    'kate',
    'nikita',
    'anna',
    'pavel',
    'sveta',
    'roman',
    'julia',
    'artem',
    'lena',
    'sergey',
  ]
  const texts = [
    'Участвую! 🍀',
    'Хочу выиграть',
    'Отличный конкурс',
    'Я тут',
    'Beru uchastie',
    'Удачи всем!',
    'Розыгрыш огонь',
    '+',
    'участвую',
    'Мечтаю победить',
  ]
  const now = Math.floor(Date.now() / 1000)
  const comments = Array.from({ length: 260 }, (_, i) => {
    const base = first[i % first.length]
    // create some duplicate authors on purpose
    const username = i % 5 === 0 ? base : `${base}_${Math.floor(i / first.length) + 1}${i % 10}`
    return {
      username,
      text: texts[i % texts.length],
      created_at_unix: now - i * 137,
    }
  })
  return { shortcode: 'DEMO_konkurs', comments }
}

export function FileUpload({ onLoaded }: { onLoaded: (r: ParsedResult) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      try {
        const text = await file.text()
        const json = JSON.parse(text)
        const result = parseCommentsJson(json)
        if (result.comments.length === 0) {
          setError('В файле не найдено ни одного комментария с ником.')
          return
        }
        onLoaded(result)
      } catch (e) {
        setError('Не удалось прочитать JSON. Проверьте, что это корректный файл выгрузки.')
      }
    },
    [onLoaded],
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text font-display text-5xl tracking-wide text-transparent sm:text-6xl">
          МОКСУ КОНКУРС
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Загрузите комментарии
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          className={`group mt-10 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 transition-colors ${
            dragging
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
            <Upload className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-foreground">Перетащите JSON сюда</p>
            <p className="mt-1 text-sm text-muted-foreground">или нажмите, чтобы выбрать файл</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <FileJson className="size-3.5" aria-hidden="true" />
            comments_*.json
          </div>
        </label>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Выбрать файл
          </Button>
          <Button variant="ghost" onClick={() => onLoaded(makeDemoData())}>
            Попробовать демо
          </Button>
        </div>

        <div className="mt-14">
          <PoweredBy />
        </div>
      </div>
    </div>
  )
}
