import {
  Code2,
  MonitorUp,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  selectActiveRoom,
  useCampfireStore,
} from '../../store/useCampfireStore'
import type { SupplyTab } from '../../types/campfire'

const TABS: { id: SupplyTab; label: string; icon: typeof Code2 }[] = [
  { id: 'dev-rig', label: 'Dev Rig', icon: Code2 },
  { id: 'study-board', label: 'Study Board', icon: PenLine },
  { id: 'screen-share', label: 'Screen Share', icon: MonitorUp },
]

export function SupplyDock() {
  const room = useCampfireStore(selectActiveRoom)
  const setActiveSupplyTab = useCampfireStore((s) => s.setActiveSupplyTab)

  if (!room) {
    return (
      <main className="flex flex-1 items-center justify-center bg-transparent">
        <p className="text-neutral-500">Select a campfire to open supplies.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-transparent">
      <div className="flex items-center gap-1 border-b border-white/10 bg-black/30 px-3 pt-2 backdrop-blur-xl">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = room.activeSupplyTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSupplyTab(id)}
              className={cn(
                'flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2 text-sm transition-all duration-300',
                active
                  ? 'border-white/15 bg-white/[0.06] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                  : 'border-transparent text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {room.activeSupplyTab === 'dev-rig' && <DevRigPlaceholder />}
        {room.activeSupplyTab === 'study-board' && <StudyBoardPlaceholder />}
        {room.activeSupplyTab === 'screen-share' && <ScreenSharePlaceholder />}
      </div>
    </main>
  )
}

function DevRigPlaceholder() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-2 text-xs text-neutral-500 backdrop-blur-xl">
        <span className="font-mono text-neutral-400">main.py · Python 3.12</span>
        <span className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-0.5 text-white/80">
          Run via Piston · Phase 2
        </span>
      </div>
      <pre className="scrollbar-thin flex-1 overflow-auto bg-[#050505] p-4 font-mono text-sm leading-relaxed text-neutral-300">
        <code>{`# Late Night Python & DSA
def max_sliding_window(nums: list[int], k: int) -> list[int]:
    """O(n) deque approach — drop your variant below."""
    from collections import deque
    dq, out = deque(), []
    for i, n in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

# TODO: Monaco editor + GitHub loader land in Phase 2
print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))`}</code>
      </pre>
    </div>
  )
}

function StudyBoardPlaceholder() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,#000000_70%)]">
      <div className="glass-panel absolute inset-6 rounded-2xl border-dashed border-white/15" />
      <Sparkles className="relative h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
      <div className="relative text-center">
        <p className="text-lg font-medium text-white">Study Canvas</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-400">
          Collaborative whiteboard, synced Pomodoro, and brown noise land in
          Phase 2. For now — keep the ember burning.
        </p>
      </div>
      <div className="relative flex gap-2">
        {['Pen', 'Highlighter', 'Sticky', 'Clear'].map((tool) => (
          <button
            key={tool}
            type="button"
            className="glass-btn rounded-xl px-3 py-1.5 text-xs text-neutral-300 transition-all duration-300 hover:text-white"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScreenSharePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-transparent">
      <div className="glass-panel flex h-40 w-72 items-center justify-center rounded-2xl">
        <MonitorUp className="h-10 w-10 text-neutral-500" />
      </div>
      <p className="text-sm text-neutral-400">
        WebRTC screen share via{' '}
        <code className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-white">
          getDisplayMedia
        </code>{' '}
        — Phase 2
      </p>
      <button
        type="button"
        className="glass-btn rounded-xl px-4 py-2 text-sm font-medium text-white"
      >
        Ready to share
      </button>
    </div>
  )
}
