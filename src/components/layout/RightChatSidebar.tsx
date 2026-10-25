import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  selectActiveRoom,
  useCampfireStore,
} from '../../store/useCampfireStore'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RightChatSidebar() {
  const room = useCampfireStore(selectActiveRoom)
  const sendMessage = useCampfireStore((s) => s.sendMessage)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room?.messages.length, room?.id])

  if (!room) {
    return (
      <aside className="glass-panel flex h-full w-full min-h-0 shrink-0 flex-col rounded-none border-y-0 border-r-0" />
    )
  }

  const submit = () => {
    sendMessage(draft)
    setDraft('')
  }

  return (
    <aside className="glass-panel flex h-full w-full min-h-0 shrink-0 flex-col rounded-none border-y-0 border-r-0">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white">Ember Chat</p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
          {room.messages.length} sparks
        </p>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {room.messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white"
              style={{ backgroundColor: msg.avatarColor }}
            >
              {msg.author.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-white">
                  {msg.author}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 text-sm leading-snug text-neutral-400">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="glass-input flex items-center gap-2 rounded-xl px-2 py-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Send a spark…"
            className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-lg border border-white/15 bg-white/[0.08] p-1.5 text-white transition-all duration-300 hover:bg-white/[0.15] hover:border-white/30 disabled:opacity-30"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        {room.timerMode === 'deadman' && (
          <p className="mt-1.5 text-[10px] text-neutral-500">
            Deadman: chatting adds +5m fuel
          </p>
        )}
      </form>
    </aside>
  )
}
