import {
  Headphones,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Volume2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import {
  selectActiveRoom,
  useCampfireStore,
} from '../../store/useCampfireStore'

export function BottomVoiceDock() {
  const room = useCampfireStore(selectActiveRoom)
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)
  const [inVoice, setInVoice] = useState(true)

  if (!room) {
    return (
      <footer className="glass-panel flex h-14 w-full shrink-0 items-center px-4 text-xs text-neutral-500">
        No active voice channel
      </footer>
    )
  }

  return (
    <footer className="glass-panel flex h-14 w-full shrink-0 items-center justify-between gap-4 rounded-none border-x-0 border-b-0 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300',
            inVoice
              ? 'border-white/25 bg-white/10 text-white ember-glow'
              : 'border-white/10 bg-white/[0.04] text-neutral-500',
          )}
        >
          <Headphones className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">
            {inVoice ? `Voice · ${room.name}` : 'Voice disconnected'}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            {inVoice ? 'Connected locally' : 'Click join to enter'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {room.participants.map((p) => (
          <div
            key={p.id}
            title={p.name}
            className={cn(
              'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white transition-all duration-300',
              p.isSpeaking && inVoice && !deafened
                ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-black shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                : '',
            )}
            style={{ backgroundColor: p.avatarColor }}
          >
            {p.name.slice(0, 2).toUpperCase()}
            {(p.isMuted || (p.id === 'you' && muted)) && (
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white/10 bg-black p-0.5">
                <MicOff className="h-2.5 w-2.5 text-neutral-300" />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <IconBtn
          label={muted ? 'Unmute' : 'Mute'}
          active={!muted}
          danger={muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </IconBtn>
        <IconBtn
          label={deafened ? 'Undeafen' : 'Deafen'}
          active={!deafened}
          danger={deafened}
          onClick={() => setDeafened((d) => !d)}
        >
          <Volume2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Screen share" onClick={() => undefined}>
          <ScreenShare className="h-4 w-4" />
        </IconBtn>
        <IconBtn
          label={inVoice ? 'Leave voice' : 'Join voice'}
          danger={inVoice}
          onClick={() => setInVoice((v) => !v)}
        >
          <PhoneOff className="h-4 w-4" />
        </IconBtn>
      </div>
    </footer>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  active,
  danger,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'rounded-xl p-2 transition-all duration-300',
        danger
          ? 'border border-white/10 bg-white/[0.06] text-neutral-300 hover:bg-white/10 hover:border-white/25 hover:text-white'
          : active
            ? 'text-white hover:bg-white/[0.07] hover:border-white/20 border border-transparent'
            : 'text-neutral-500 hover:bg-white/[0.07] hover:text-white border border-transparent',
      )}
    >
      {children}
    </button>
  )
}
