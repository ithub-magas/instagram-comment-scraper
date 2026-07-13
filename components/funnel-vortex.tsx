'use client'

import { useEffect, useRef } from 'react'
import type { Comment } from '@/lib/comments'

const TWO_PI = Math.PI * 2
const DURATION = 4400

// Theme-matched colors (canvas fillStyle needs concrete values)
const GOLD = '#e8b23a'
const RED = '#e0533d'
const TEXT = '#efe9dc'

type Particle = {
  name: string
  a: number
  r: number
  turns: number
  size: number
  color: string
  drift: number
}

function sample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice()
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

/**
 * Canvas funnel/vortex: participant names swirl and get sucked into the
 * center of a funnel; the winner spirals in and grows at the throat.
 */
export function FunnelVortex({
  participants,
  winner,
  onComplete,
}: {
  participants: Comment[]
  winner: Comment
  onComplete: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Build particles from a sample of participants (winner excluded here).
    const others = participants.filter(
      (p) => p.username.toLowerCase() !== winner.username.toLowerCase(),
    )
    const chosen = sample(others, 150)
    const particles: Particle[] = chosen.map((c) => ({
      name: c.username,
      a: Math.random() * TWO_PI,
      r: 0.28 + Math.random() * 0.72,
      turns: 2 + Math.random() * 3.5,
      size: 11 + Math.random() * 8,
      color: Math.random() < 0.18 ? (Math.random() < 0.5 ? GOLD : RED) : TEXT,
      drift: Math.random() * TWO_PI,
    }))

    const winnerParticle: Particle = {
      name: winner.username,
      a: Math.random() * TWO_PI,
      r: 1,
      turns: 3.5,
      size: 20,
      color: GOLD,
      drift: 0,
    }

    const start = performance.now()
    const easeIn = (t: number) => t * t

    const drawFunnel = (cx: number, cy: number, maxR: number, now: number) => {
      const rings = 6
      const rot = now * 0.0004
      for (let i = 0; i < rings; i++) {
        const rr = maxR * (1 - i / (rings + 1))
        ctx.beginPath()
        ctx.ellipse(cx, cy, rr, rr * 0.52, 0, 0, TWO_PI)
        ctx.strokeStyle = `rgba(232, 178, 58, ${0.05 + (i / rings) * 0.12})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      // spiral throat
      ctx.beginPath()
      for (let s = 0; s < 220; s++) {
        const p = s / 220
        const ang = p * TWO_PI * 4 + rot * 6
        const rad = maxR * (1 - p) * 0.95
        const x = cx + Math.cos(ang) * rad
        const y = cy + Math.sin(ang) * rad * 0.52
        if (s === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(232, 178, 58, 0.12)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const frame = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / DURATION, 1)
      const ease = easeIn(t)

      const cx = width / 2
      const cy = height / 2
      const maxR = Math.min(width, height * 1.6) * 0.42

      ctx.clearRect(0, 0, width, height)

      // center glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      glow.addColorStop(0, `rgba(232, 178, 58, ${0.1 + ease * 0.25})`)
      glow.addColorStop(1, 'rgba(232, 178, 58, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      drawFunnel(cx, cy, maxR, now)

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // swirling names
      for (const p of particles) {
        const ang = p.a + ease * p.turns * TWO_PI + now * 0.0007
        const rad = p.r * (1 - ease) * maxR + 4
        const x = cx + Math.cos(ang) * rad
        const y = cy + Math.sin(ang) * rad * 0.52
        const alpha = Math.max(0, 1 - ease * 1.15)
        const size = p.size * (0.55 + (1 - ease) * 0.45)
        ctx.font = `600 ${size}px var(--font-inter), sans-serif`
        ctx.fillStyle =
          p.color === TEXT
            ? `rgba(239, 233, 220, ${alpha * 0.85})`
            : p.color === GOLD
              ? `rgba(232, 178, 58, ${alpha})`
              : `rgba(224, 83, 61, ${alpha})`
        ctx.fillText('@' + p.name, x, y)
      }

      // winner spirals in and grows toward the throat
      const wAng = winnerParticle.a + ease * winnerParticle.turns * TWO_PI + now * 0.0007
      const wRad = winnerParticle.r * (1 - ease) * maxR
      const wx = cx + Math.cos(wAng) * wRad
      const wy = cy + Math.sin(wAng) * wRad * 0.52
      const wSize = winnerParticle.size * (1 + ease * 2.2)
      ctx.font = `800 ${wSize}px var(--font-bebas), var(--font-inter), sans-serif`
      ctx.shadowColor = 'rgba(232, 178, 58, 0.9)'
      ctx.shadowBlur = 10 + ease * 30
      ctx.fillStyle = GOLD
      ctx.fillText('@' + winnerParticle.name, wx, wy)
      ctx.shadowBlur = 0

      if (t < 1) {
        raf = requestAnimationFrame(frame)
      } else if (!doneRef.current) {
        doneRef.current = true
        setTimeout(onComplete, 350)
      }
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [participants, winner, onComplete])

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="h-64 w-full sm:h-72"
        aria-label="Анимация выбора победителя"
      />
    </div>
  )
}
