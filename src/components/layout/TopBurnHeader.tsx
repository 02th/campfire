import { Flame, Fuel, Timer, Settings, UserPlus, X, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatTimer, useCampfireStore } from '../../store/useCampfireStore'
import type { RoomCategory, TimerMode } from '../../types/campfire'
import { UserProfilePopover } from '../UserProfilePopover'

const MODE_LABEL = {
  countdown: 'COUNTDOWN',
  deadman: 'DEADMAN',
  pomodoro: 'POMODORO',
} as const

export function TopBurnHeader() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const addFuel = useCampfireStore((state) => state.addFuel)
  const updateRoom = useCampfireStore((state) => state.updateRoom)
  const adjustTimer = useCampfireStore((state) => state.adjustTimer)
  const resetTimer = useCampfireStore((state) => state.resetTimer)
  const deleteRoom = useCampfireStore((state) => state.deleteRoom)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const [modal, setModal] = useState<'settings' | 'connect' | null>(null)
  const [profileCard, setProfileCard] = useState<{ name: string; color: string } | null>(null)
  const exportSession = () => {
    if (!room) return
    const pinned = room.messages.filter((message) => message.pinned)
    const report = [
      `# Campfire Session Report: ${room.name}`,
      '',
      `- Topic: ${room.topic}`,
      `- Category: ${room.category}`,
      `- Timer mode: ${room.timerMode}`,
      `- Participants: ${room.participants.map((participant) => participant.name).join(', ')}`,
      '',
      '## Shared Scratchpad',
      room.scratchpad || '_No notes._',
      '',
      '## Solved Problem',
      room.solverLesson ? `### ${room.solverLesson.question}\n\n${room.solverLesson.concept}\n\n${room.solverLesson.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.content}`).join('\n')}\n\n**Answer:** ${room.solverLesson.finalAnswer}` : '_No solved problems._',
      '',
      '## Pinned Chat Messages',
      pinned.map((message) => `- **${message.author}:** ${message.content}`).join('\n') || '_No pinned messages._',
      '',
      '## Dev Rig Files',
      ...room.workspaceFiles.flatMap((file) => [`### ${file.name}`, '```', file.content, '```', '']),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${room.name.replace(/[^\w-]+/g, '-')}-session.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  useEffect(() => {
    if (!modal) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [modal])

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
        <Flame className="h-4 w-4 shrink-0 text-white" />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
              {room?.name ?? 'No campfire selected'}
            </h1>
            {room && (
              <span className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium tracking-[0.12em] text-neutral-400 sm:inline">
                {MODE_LABEL[room.timerMode]}
              </span>
            )}
          </div>
          {room?.topic && (
            <p className="truncate text-[10px] text-neutral-500">{room.topic}</p>
          )}
        </div>
      </div>

      {room && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center -space-x-2 md:flex" aria-label={`${room.participants.length} participants`}>
            {room.participants.slice(0, 4).map((participant) => (
              <button
                type="button"
                key={participant.id}
                onClick={() => setProfileCard({ name: participant.name, color: participant.avatarColor })}
                title={participant.name}
                className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0B0B0E] text-[9px] font-semibold text-white"
                style={{ backgroundColor: participant.avatarColor }}
              >
                {participant.name.slice(0, 2).toUpperCase()}
                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0B0B0E] ${participant.status === 'idle' ? 'bg-[#F59E0B]' : participant.status === 'dnd' ? 'bg-[#EF4444]' : participant.status === 'invisible' ? 'bg-[#71717A]' : 'bg-[#22C55E]'}`} />
              </button>
            ))}
            {room.participants.length > 4 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0B0B0E] bg-neutral-700 text-[9px] text-white">
                +{room.participants.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1">
            <Timer className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-mono text-sm font-semibold tabular-nums text-white">
              {formatTimer(room.remainingSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => addFuel()}
            aria-label="Stoke this campfire with 15 minutes"
            title="Add 15 minutes"
            className="glass-btn-primary flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu active:scale-[0.97] sm:px-3"
          >
            <Fuel className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Stoke +15m</span>
            <span className="sm:hidden">+15m</span>
          </button>
          <button type="button" aria-label="Export session report" title="Export Session" onClick={exportSession} className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:bg-white/[0.08] hover:text-white"><Download className="h-4 w-4" /></button>
          <button type="button" aria-label="Room settings" title="Room Settings" onClick={() => setModal('settings')} className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:bg-white/[0.08] hover:text-white"><Settings className="h-4 w-4" /></button>
        </div>
      )}
      <button type="button" aria-label="Connect to Code2Gether" title="Connect to Code2Gether" onClick={() => setModal('connect')} className="ml-2 flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:bg-white/[0.08] hover:text-white"><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Connect to Code2Gether</span></button>
      {modal && (room || modal === 'connect') && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md" onClick={() => setModal(null)}>
        <section role="dialog" aria-modal="true" aria-label={modal === 'settings' ? 'Room settings' : 'Code2Gether'} onClick={(event) => event.stopPropagation()} className="glass-panel-dense w-full max-w-lg rounded-2xl p-5">
          <header className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-white">{modal === 'settings' ? 'Room Settings' : 'Connect to Code2Gether'}</h2><button onClick={() => setModal(null)} aria-label="Close"><X className="h-4 w-4 text-neutral-400" /></button></header>
          {modal === 'settings' && room ? <div className="space-y-4">
            <label className="block space-y-1 text-xs text-neutral-400">Room Name<input value={room.name} onChange={(event) => updateRoom({ name: event.target.value })} className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block space-y-1 text-xs text-neutral-400">Topic / Goal<input value={room.topic} onChange={(event) => updateRoom({ topic: event.target.value })} className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white outline-none" /></label>
            <label className="block space-y-1 text-xs text-neutral-400">Timer Mode<select value={room.timerMode} onChange={(event) => updateRoom({ timerMode: event.target.value as TimerMode })} className="glass-input w-full rounded-lg p-2 text-sm text-white"><option value="countdown">COUNTDOWN</option><option value="pomodoro">POMODORO</option><option value="deadman">DEADMAN</option></select></label>
            <div className="flex gap-2">{[5, 15, 30].map((minutes) => <button key={minutes} onClick={() => adjustTimer(minutes * 60)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-200 hover:bg-white/10">+{minutes}m</button>)}<button onClick={resetTimer} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-200 hover:bg-white/10">Reset Timer</button></div>
            <label className="block space-y-1 text-xs text-neutral-400">Category<select value={room.category} onChange={(event) => updateRoom({ category: event.target.value as RoomCategory })} className="glass-input w-full rounded-lg p-2 text-white"><option>DSA &amp; Coding</option><option>Chem &amp; Bio</option><option>Music &amp; Beats</option><option>General Grind</option></select></label>
            <label className="flex items-center justify-between text-sm text-neutral-300">Slowmode<input type="checkbox" checked={room.slowmode} onChange={(event) => updateRoom({ slowmode: event.target.checked })} className="accent-white" /></label>
            <div className="border-t border-red-500/20 pt-3"><button onClick={() => { deleteRoom(room.id); setModal(null) }} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20">🔥 Extinguish (Delete) Campfire</button></div>
          </div> : <div className="space-y-3">
            <p className="text-sm text-neutral-300">Campfire is currently being developed. Please stand by.</p>
            <p className="text-xs leading-relaxed text-neutral-500">Online invites and shared presence will be available when collaboration is ready.</p>
          </div>}
          {profileCard && <UserProfilePopover name={profileCard.name} color={profileCard.color} onClose={() => setProfileCard(null)} />}
        </section>
      </div>}
    </div>
  )
}
