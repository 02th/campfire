import { Flame, Plus, Radio } from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  formatTimer,
  selectActiveRoom,
  useCampfireStore,
} from '../../store/useCampfireStore'
import type { TimerMode } from '../../types/campfire'

const MODE_LABEL: Record<TimerMode, string> = {
  countdown: 'COUNTDOWN',
  deadman: 'DEADMAN',
  pomodoro: 'POMODORO',
}

export function RadarSidebar() {
  const rooms = useCampfireStore((s) => s.rooms)
  const activeRoom = useCampfireStore(selectActiveRoom)
  const setActiveRoom = useCampfireStore((s) => s.setActiveRoom)
  const openCreateModal = useCampfireStore((s) => s.openCreateModal)

  return (
    <aside className="glass-panel flex h-full w-full min-h-0 shrink-0 flex-col rounded-none border-y-0 border-l-0">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] ember-glow">
          <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">
            CAMPFIRE
          </p>
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            <Radio className="h-3 w-3 text-white/70" />
            Radar live
          </p>
        </div>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          onClick={openCreateModal}
          className="glass-btn flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.12] hover:border-white/25"
        >
          <Plus className="h-4 w-4" />
          Light a Campfire
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Active embers · {rooms.length}
        </p>
        {rooms.map((room) => {
          const isActive = room.id === activeRoom?.id
          const progress =
            room.initialSeconds > 0
              ? (room.remainingSeconds / room.initialSeconds) * 100
              : 0

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoom(room.id)}
              className={cn(
                'group w-full rounded-xl px-3 py-3 text-left transition-all duration-300',
                isActive ? 'glass-card-active' : 'glass-card border-transparent',
              )}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'line-clamp-2 text-sm font-medium leading-snug',
                    isActive ? 'text-white' : 'text-neutral-200',
                  )}
                >
                  {room.name}
                </span>
                <span
                  className={cn(
                    'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                    room.isBurning
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] animate-pulse'
                      : 'bg-white/20',
                  )}
                />
              </div>
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
                <span>{MODE_LABEL[room.timerMode]}</span>
                <span className="font-mono text-white/80 tabular-nums">
                  {formatTimer(room.remainingSeconds)}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/40 via-white to-white/70 transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  style={{ width: `${Math.max(2, progress)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                {room.participants.length} gathered
              </p>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
