import { create } from 'zustand'
import type {
  CampfireRoom,
  CampfireStore,
  CreateCampfireInput,
  SupplyTab,
} from '../types/campfire'

const AVATAR_COLORS = [
  '#1A1A1A',
  '#2A2A2A',
  '#3F3F3F',
  '#525252',
  '#404040',
  '#171717',
  '#262626',
]

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function formatSeedMessage(
  author: string,
  content: string,
  minutesAgo: number,
  color: string,
) {
  return {
    id: uid('msg'),
    author,
    content,
    timestamp: Date.now() - minutesAgo * 60_000,
    avatarColor: color,
  }
}

function buildDefaultRooms(): CampfireRoom[] {
  const now = Date.now()

  return [
    {
      id: 'room_python_dsa',
      name: 'Late Night Python & DSA',
      topic: 'Grind LeetCode mediums · share solutions in Dev Rig',
      timerMode: 'countdown',
      remainingSeconds: 2 * 3600 + 47 * 60 + 18,
      initialSeconds: 3 * 3600,
      isBurning: true,
      activeSupplyTab: 'dev-rig',
      createdAt: now - 40 * 60_000,
      lastActivityAt: now,
      participants: [
        {
          id: 'p1',
          name: 'Nova',
          isSpeaking: true,
          isMuted: false,
          avatarColor: AVATAR_COLORS[0],
        },
        {
          id: 'p2',
          name: 'Kai',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[3],
        },
        {
          id: 'p3',
          name: 'Rhea',
          isSpeaking: false,
          isMuted: true,
          avatarColor: AVATAR_COLORS[5],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Nova',
          'Stuck on the sliding window variant — anyone free?',
          12,
          AVATAR_COLORS[0],
        ),
        formatSeedMessage(
          'Kai',
          'Drop it in Dev Rig. I just finished #424.',
          9,
          AVATAR_COLORS[3],
        ),
        formatSeedMessage(
          'Rhea',
          'Brown noise on, headphones in. Locking in 🔥',
          4,
          AVATAR_COLORS[5],
        ),
      ],
    },
    {
      id: 'room_ochem',
      name: 'Organic Chem Cram',
      topic: 'SN1/SN2 mechanisms · Study Board open',
      timerMode: 'pomodoro',
      remainingSeconds: 18 * 60 + 42,
      initialSeconds: 25 * 60,
      isBurning: true,
      pomodoroPhase: 'focus',
      activeSupplyTab: 'study-board',
      createdAt: now - 25 * 60_000,
      lastActivityAt: now,
      participants: [
        {
          id: 'p4',
          name: 'Mira',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[4],
        },
        {
          id: 'p5',
          name: 'Jules',
          isSpeaking: true,
          isMuted: false,
          avatarColor: AVATAR_COLORS[1],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Mira',
          'Carbocation rearrangements are evil tonight.',
          8,
          AVATAR_COLORS[4],
        ),
        formatSeedMessage(
          'Jules',
          'Sketching the energy diagram on the board — peek?',
          3,
          AVATAR_COLORS[1],
        ),
      ],
    },
    {
      id: 'room_lofi',
      name: 'Lo-Fi Beat Lab',
      topic: 'Sample flips · screen share your DAW',
      timerMode: 'deadman',
      remainingSeconds: 55 * 60 + 7,
      initialSeconds: 60 * 60,
      isBurning: true,
      activeSupplyTab: 'screen-share',
      createdAt: now - 15 * 60_000,
      lastActivityAt: now,
      participants: [
        {
          id: 'p6',
          name: 'Echo',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[6],
        },
        {
          id: 'p7',
          name: 'Ash',
          isSpeaking: false,
          isMuted: true,
          avatarColor: AVATAR_COLORS[0],
        },
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        formatSeedMessage(
          'Echo',
          'Deadman timer — keep chatting or we burn out.',
          6,
          AVATAR_COLORS[6],
        ),
        formatSeedMessage(
          'Ash',
          'Sharing Ableton now. Feedback welcome on the hats.',
          2,
          AVATAR_COLORS[0],
        ),
      ],
    },
  ]
}

const FUEL_SECONDS = 30 * 60

export const useCampfireStore = create<CampfireStore>((set, get) => ({
  rooms: buildDefaultRooms(),
  activeRoomId: 'room_python_dsa',
  isCreateModalOpen: false,

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  addFuel: (roomId) => {
    const id = roomId ?? get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? {
              ...room,
              remainingSeconds: room.remainingSeconds + FUEL_SECONDS,
              initialSeconds: Math.max(
                room.initialSeconds,
                room.remainingSeconds + FUEL_SECONDS,
              ),
              isBurning: true,
              lastActivityAt: Date.now(),
            }
          : room,
      ),
    }))
  },

  createRoom: (input: CreateCampfireInput) => {
    const seconds = Math.max(1, input.durationMinutes) * 60
    const room: CampfireRoom = {
      id: uid('room'),
      name: input.name.trim() || 'Untitled Campfire',
      topic: input.topic.trim() || 'No topic set',
      timerMode: input.timerMode,
      remainingSeconds: seconds,
      initialSeconds: seconds,
      isBurning: true,
      activeSupplyTab: 'dev-rig',
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      pomodoroPhase: input.timerMode === 'pomodoro' ? 'focus' : undefined,
      participants: [
        {
          id: 'you',
          name: 'You',
          isSpeaking: false,
          isMuted: false,
          avatarColor: AVATAR_COLORS[2],
        },
      ],
      messages: [
        {
          id: uid('msg'),
          author: 'System',
          content: `Campfire lit · ${input.timerMode} · ${input.durationMinutes}m fuel`,
          timestamp: Date.now(),
          avatarColor: '#FF8A00',
        },
      ],
    }

    set((state) => ({
      rooms: [room, ...state.rooms],
      activeRoomId: room.id,
      isCreateModalOpen: false,
    }))
  },

  setActiveSupplyTab: (tab: SupplyTab) => {
    const id = get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? { ...room, activeSupplyTab: tab, lastActivityAt: Date.now() }
          : room,
      ),
    }))
  },

  sendMessage: (content) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const id = get().activeRoomId
    if (!id) return

    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (room.id !== id) return room

        const next = {
          ...room,
          lastActivityAt: Date.now(),
          messages: [
            ...room.messages,
            {
              id: uid('msg'),
              author: 'You',
              content: trimmed,
              timestamp: Date.now(),
              avatarColor: AVATAR_COLORS[2],
            },
          ],
        }

        // Deadman: activity refuels a slice of the timer
        if (room.timerMode === 'deadman') {
          next.remainingSeconds = Math.min(
            room.initialSeconds,
            room.remainingSeconds + 5 * 60,
          )
        }

        return next
      }),
    }))
  },

  bumpActivity: (roomId) => {
    const id = roomId ?? get().activeRoomId
    if (!id) return
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, lastActivityAt: Date.now() } : room,
      ),
    }))
  },

  tick: () => {
    set((state) => ({
      rooms: state.rooms.map((room) => {
        if (!room.isBurning || room.remainingSeconds <= 0) {
          return room.remainingSeconds <= 0
            ? { ...room, isBurning: false, remainingSeconds: 0 }
            : room
        }

        const remainingSeconds = room.remainingSeconds - 1

        if (remainingSeconds <= 0) {
          // Pomodoro: flip phase and refill once when focus ends
          if (room.timerMode === 'pomodoro' && room.pomodoroPhase === 'focus') {
            return {
              ...room,
              remainingSeconds: 5 * 60,
              initialSeconds: 5 * 60,
              pomodoroPhase: 'break',
              isBurning: true,
            }
          }
          return { ...room, remainingSeconds: 0, isBurning: false }
        }

        return { ...room, remainingSeconds }
      }),
    }))
  },
}))

/** Live 1Hz countdown for all burning rooms. */
let tickStarted = false
export function startCampfireTicker() {
  if (tickStarted || typeof window === 'undefined') return
  tickStarted = true
  window.setInterval(() => {
    useCampfireStore.getState().tick()
  }, 1000)
}

export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function selectActiveRoom(state: CampfireStore): CampfireRoom | null {
  return state.rooms.find((r) => r.id === state.activeRoomId) ?? null
}
