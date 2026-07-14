'use client'

import { RotateCcw, Settings2, Users, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DEFAULT_DRAW_SETTINGS,
  type DrawSettings,
  type ParticipantMode,
} from '@/lib/comments'

type SettingsPanelProps = {
  settings: DrawSettings
  eligibleCount: number
  onChange: (settings: DrawSettings) => void
}

export function SettingsPanel({ settings, eligibleCount, onChange }: SettingsPanelProps) {
  const update = <K extends keyof DrawSettings>(key: K, value: DrawSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="secondary" size="icon-lg" aria-label="Настройки розыгрыша" />
        }
      >
        <Settings2 aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            Настройки розыгрыша
          </DialogTitle>
          <DialogDescription>
            Фильтры применяются сразу к списку и выбору победителя.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Допущено к розыгрышу
          </p>
          <p className="mt-1 font-display text-3xl text-foreground">
            {eligibleCount.toLocaleString('ru-RU')}
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel>Режим участия</FieldLabel>
            <ToggleGroup
              value={[settings.mode]}
              onValueChange={(values) => {
                const mode = values[0] as ParticipantMode | undefined
                if (mode) update('mode', mode)
              }}
              variant="outline"
              spacing={2}
              className="grid w-full grid-cols-2"
            >
              <ToggleGroupItem value="unique" aria-label="Уникальные пользователи">
                <Users data-icon="inline-start" />
                Уникальные
              </ToggleGroupItem>
              <ToggleGroupItem value="all" aria-label="Все комментарии">
                <MessageSquare data-icon="inline-start" />
                Все комментарии
              </ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>
              {settings.mode === 'unique'
                ? 'Один пользователь получает один шанс, учитывается его самый ранний комментарий.'
                : 'Каждый подходящий комментарий считается отдельным шансом, включая дубликаты.'}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="draw-keyword">Обязательное ключевое слово</FieldLabel>
            <Input
              id="draw-keyword"
              value={settings.keyword}
              onChange={(event) => update('keyword', event.target.value)}
              placeholder="Например: участвую"
              autoComplete="off"
            />
            <FieldDescription>
              Регистр не учитывается. Оставьте поле пустым, чтобы пропустить фильтр.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="excluded-usernames">Исключённые ники</FieldLabel>
            <Textarea
              id="excluded-usernames"
              value={settings.excludedUsernames}
              onChange={(event) => update('excludedUsernames', event.target.value)}
              placeholder={'@organizer, @bot\n@another_user'}
              rows={3}
            />
            <FieldDescription>
              Разделяйте ники запятыми, пробелами или переносами строк. Символ @ необязателен.
            </FieldDescription>
          </Field>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Исключать пустые комментарии</FieldTitle>
              <FieldDescription>
                Записи без текста не попадут в список участников.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="exclude-empty"
              checked={settings.excludeEmpty}
              onCheckedChange={(checked) => update('excludeEmpty', checked)}
              aria-label="Исключать пустые комментарии"
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(DEFAULT_DRAW_SETTINGS)}
          >
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Сбросить настройки
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
