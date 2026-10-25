import { useEffect } from 'react'
import liquidGL from 'liquid-gl'

// liquidGL snapshots and refracts page content through a GPU-backed lens.
// Keep the initial integration scoped to the bottom dock to limit GPU work.
export function LiquidGlass() {
  useEffect(() => {
    const element = document.querySelector<HTMLElement>('.liquid-glass-dock')
    if (!element) return

    const glass = liquidGL({
      target: '.liquid-glass-dock',
      engine: 'auto',
      snapshot: 'body',
      resolution: 1.25,
      refraction: 0.025,
      bevelDepth: 0.075,
      bevelWidth: 0.14,
      frost: 0,
      shadow: true,
      specular: true,
      tint: 'rgba(16, 16, 20, 0.2)',
      reveal: 'fade',
    })

    return () => {
      glass.destroy()
    }
  }, [])

  return null
}
