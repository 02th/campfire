import { useEffect } from 'react'
import liquidGL from 'liquid-gl'

// Start with one dock so the GPU-backed effect stays contained and measurable.
export function LiquidGlass() {
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('.liquid-glass-dock')
    if (!target) return

    const lens = liquidGL({
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
      lens?.destroy()
    }
  }, [])

  return null
}
