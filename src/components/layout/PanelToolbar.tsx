import {
  ArrowLeftRight,
  Columns2,
  EyeOff,
  Minimize2,
  PlusSquare,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useLayoutStore } from '../../store/useLayoutStore'

interface PanelToolbarProps {
  panelId: string
  label: string
  minimized?: boolean
  className?: string
}

export function PanelToolbar({
  panelId,
  label,
  minimized = false,
  className,
}: PanelToolbarProps) {
  const movePanel = useLayoutStore((s) => s.movePanel)
  const splitPane = useLayoutStore((s) => s.splitPane)
  const toggleMinimize = useLayoutStore((s) => s.toggleMinimize)
  const addCustomSlot = useLayoutStore((s) => s.addCustomSlot)

  return (
    <div
      className={cn(
        'pointer-events-auto absolute left-1/2 top-2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/20 bg-black/70 px-1.5 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        className,
      )}
      role="toolbar"
      aria-label={`${label} layout controls`}
    >
      <span className="hidden max-w-[7rem] truncate px-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:inline">
        {label}
      </span>

      <ToolBtn
        label="Move left"
        onClick={() => movePanel(panelId, 'left')}
      >
        <ArrowLeftRight className="h-3.5 w-3.5 -scale-x-100" />
      </ToolBtn>
      <ToolBtn
        label="Move right"
        onClick={() => movePanel(panelId, 'right')}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn label="Split pane" onClick={() => splitPane(panelId)}>
        <Columns2 className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        label={minimized ? 'Hide element' : 'Minimize element'}
        onClick={() => toggleMinimize(panelId)}
      >
        {minimized ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Minimize2 className="h-3.5 w-3.5" />
        )}
      </ToolBtn>
      <ToolBtn
        label="Add new custom panel slot"
        onClick={() => addCustomSlot(panelId)}
      >
        <PlusSquare className="h-3.5 w-3.5" />
      </ToolBtn>
    </div>
  )
}

function ToolBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="rounded-lg border border-transparent p-1.5 text-neutral-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </button>
  )
}
