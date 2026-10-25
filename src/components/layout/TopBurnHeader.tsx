import {
  Flame,
  Fuel,
  LayoutDashboard,
  RotateCcw,
  Timer,
  Users,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  formatTimer,
  selectActiveRoom,
  useCampfireStore,
} from '../../store/useCampfireStore'
import {
  selectHiddenPanels,
  useLayoutStore,
} from '../../store/useLayoutStore'

export function TopBurnHeader() {
  const room = useCampfireStore(selectActiveRoom)
  const addFuel = useCampfireStore((s) => s.addFuel)
  const customizeMode = useLayoutStore((s) => s.customizeMode)
  const toggleCustomizeMode = useLayoutStore((s) => s.toggleCustomizeMode)
  const resetLayout = useLayoutStore((s) => s.resetLayout)
  const restorePanel = useLayoutStore((s) => s.restorePanel)
  const hiddenPanels = useLayoutStore(selectHiddenPanels)

  const progress =
    room && room.initialSeconds > 0
      ? (room.remainingSeconds / room.initialSeconds) * 100
      : 0

  return (
    <header className="glass-panel relative flex h-16 shrink-0 items-center justify-between gap-3 overflow-hidden rounded-none border-x-0 border-t-0 px-4 sm:px-6">
      {room && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
          aria-hidden
        >
          <div
            className="h-full bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-1000 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="min-w-0">
        {room ? (
          <>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 shrink-0 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <h1 className="truncate text-base font-semibold text-white">
                {room.name}
              </h1>
            </div>
            <p className="mt-0.5 truncate text-xs text-neutral-400">
              {room.topic}
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-400">
            No campfire selected — light one from the Radar.
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {customizeMode && hiddenPanels.length > 0 && (
          <div className="hidden max-w-[12rem] flex-wrap items-center justify-end gap-1 lg:flex">
            {hiddenPanels.map((p) => (
              <button
                key={p.id}
                type="button"
                title={`Restore ${p.label}`}
                onClick={() => restorePanel(p.id)}
                className="rounded-lg border border-dashed border-white/20 bg-white/[0.04] px-2 py-1 text-[10px] text-neutral-400 transition-all hover:border-white/35 hover:bg-white/[0.08] hover:text-white"
              >
                + {p.label}
              </button>
            ))}
          </div>
        )}

        {customizeMode && (
          <button
            type="button"
            onClick={resetLayout}
            className="glass-btn flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-white/25 hover:text-white"
            title="Reset layout to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset to Default</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleCustomizeMode}
          aria-pressed={customizeMode}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-300',
            customizeMode
              ? 'border border-white/30 bg-white/15 text-white ember-glow'
              : 'glass-btn text-neutral-300 hover:border-white/25 hover:text-white',
          )}
          title={
            customizeMode
              ? 'Exit customize layout'
              : 'Customize layout'
          }
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            {customizeMode ? 'Done' : 'Customize Layout'}
          </span>
        </button>

        {room && (
          <>
            <div className="hidden items-center gap-2 text-xs text-neutral-400 lg:flex">
              <Users className="h-3.5 w-3.5" />
              {room.participants.length}
            </div>

            <div className="glass-card flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/[0.06]">
              <Timer className="h-4 w-4 text-white/80" />
              <div className="text-right">
                <p className="timer-glow font-mono text-lg font-semibold leading-none tracking-wider text-white tabular-nums">
                  {formatTimer(room.remainingSeconds)}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                  {room.timerMode}
                  {room.timerMode === 'pomodoro' && room.pomodoroPhase
                    ? ` · ${room.pomodoroPhase}`
                    : ''}
                  {!room.isBurning ? ' · extinguished' : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addFuel()}
              className="glass-btn-primary flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold active:scale-[0.98]"
            >
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">+ Add Fuel</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
