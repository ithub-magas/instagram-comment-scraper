export type Comment = {
  username: string
  text: string
  created_at_unix?: number
  created_at_iso?: string
  created_at_readable?: string
}

export type ParsedResult = {
  shortcode?: string
  scraped_at?: string
  comments: Comment[]
}

const MONTHS_RU = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

/** Human readable date, falls back to unix timestamp if readable is missing. */
export function formatDate(c: Comment): string {
  if (c.created_at_readable) return c.created_at_readable
  const unix = c.created_at_unix ?? (c.created_at_iso ? Date.parse(c.created_at_iso) / 1000 : NaN)
  if (!unix || Number.isNaN(unix)) return '—'
  const d = new Date(unix * 1000)
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}, ${time}`
}

function coerceComment(raw: unknown): Comment | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const username =
    (o.username as string) ??
    (o.user as string) ??
    ((o.owner as Record<string, unknown> | undefined)?.username as string)
  if (!username || typeof username !== 'string') return null
  return {
    username: username.trim(),
    text: typeof o.text === 'string' ? o.text : '',
    created_at_unix: typeof o.created_at_unix === 'number' ? o.created_at_unix : undefined,
    created_at_iso: typeof o.created_at_iso === 'string' ? o.created_at_iso : undefined,
    created_at_readable:
      typeof o.created_at_readable === 'string' ? o.created_at_readable : undefined,
  }
}

/** Accepts either the scraper's wrapper object or a raw array of comments. */
export function parseCommentsJson(input: unknown): ParsedResult {
  let list: unknown[] = []
  let shortcode: string | undefined
  let scraped_at: string | undefined

  if (Array.isArray(input)) {
    list = input
  } else if (input && typeof input === 'object') {
    const o = input as Record<string, unknown>
    if (Array.isArray(o.comments)) list = o.comments
    shortcode = typeof o.shortcode === 'string' ? o.shortcode : undefined
    scraped_at = typeof o.scraped_at === 'string' ? o.scraped_at : undefined
  }

  const comments = list
    .map(coerceComment)
    .filter((c): c is Comment => c !== null)

  return { comments, shortcode, scraped_at }
}

/** Remove duplicate authors — one participant = one entry (keeps earliest comment). */
export function dedupeByUsername(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  for (const c of comments) {
    const key = c.username.toLowerCase()
    const existing = map.get(key)
    if (!existing) {
      map.set(key, c)
    } else {
      const a = existing.created_at_unix ?? Infinity
      const b = c.created_at_unix ?? Infinity
      if (b < a) map.set(key, c)
    }
  }
  return Array.from(map.values())
}
