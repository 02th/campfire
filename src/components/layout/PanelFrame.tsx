import { Maximize2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useLayoutStore } from '../../store/useLayoutStore'
import { PanelToolbar } from './PanelToolbar'

interface PanelFrameProps {
  panelId: string
  children: ReactNode
  className?: string
  /** When true, frame fills available flex space. */
  grow?: boolean
}

export function PanelFrame({
  panelId,
  children,
  className,
  grow = false,
}: PanelFrameProps) {
  const customizeMode = useLayoutStore((s) => s.customizeMode)
  const panel = useLayoutStore((s) => s.panels[panelId])
  if (!panel || panel.hidden) return null

  if (panel.minimized) {
    return (
      <div
        className={cn(
          'relative flex h-9 shrink-0 items-center border border-white/10 bg-black/50 px-3',
          customizeMode && 'ring-1 ring-white/25 ring-offset-1 ring-offset-black',
          className,
        )}
      >
        {customizeMode && (
          <PanelToolbar
            panelId={panelId}
            label={panel.label}
            minimized
            className="top-1"
          />
        )}
        <p className="truncate text-xs text-neutral-400">{panel.label}</p>
        <button
          type="button"
          title="Expand panel"
          aria-label={`Expand ${panel.label}`}
          onClick={() =>
            useLayoutStore.setState((s) => ({
              panels: {
                ...s.panels,
                [panelId]: {
                  ...s.panels[panelId],
                  minimized: false,
                },
              },
            }))
          }
          className="ml-auto rounded-lg border border-white/10 p-1 text-neutral-400 transition-all hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative min-h-0 min-w-0',
        grow ? 'flex flex-1 flex-col' : 'shrink-0',
        customizeMode &&
          'outline outline-1 outline-dashed outline-white/20 outline-offset-[-1px]',
        className,
      )}
    >
      {customizeMode && (
        <PanelToolbar panelId={panelId} label={panel.label} />
      )}
      <div className={cn('min-h-0 min-w-0', grow && 'flex flex-1 flex-col')}>
        {children}
      </div>
    </div>
  )
}
