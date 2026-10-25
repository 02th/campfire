/** Timer modes that drive how a Campfire self-destructs. */
export type TimerMode = 'countdown' | 'deadman' | 'pomodoro'

/** Tabs available inside the Supply Dock. */
export type SupplyTab = 'dev-rig' | 'study-board' | 'screen-share'

export type PomodoroPhase = 'focus' | 'break'

export interface ChatMessage {
  id: string
  author: string
  content: string
  timestamp: number
  avatarColor: string
}

export interface CampfireParticipant {
  id: string
  name: string
  isSpeaking: boolean
  isMuted: boolean
  avatarColor: string
}

export interface CampfireRoom {
  id: string
  name: string
  topic: string
  timerMode: TimerMode
  /** Seconds left until the campfire burns out. */
  remainingSeconds: number
  /** Original fuel duration in seconds (for progress UI). */
  initialSeconds: number
  isBurning: boolean
  participants: CampfireParticipant[]
  messages: ChatMessage[]
  activeSupplyTab: SupplyTab
  createdAt: number
  lastActivityAt: number
  pomodoroPhase?: PomodoroPhase
}

export interface CreateCampfireInput {
  name: string
  topic: string
  timerMode: TimerMode
  /** Duration in minutes (countdown / deadman / pomodoro focus). */
  durationMinutes: number
}

export interface CampfireStore {
  rooms: CampfireRoom[]
  activeRoomId: string | null
  isCreateModalOpen: boolean
  setActiveRoom: (roomId: string) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  addFuel: (roomId?: string) => void
  createRoom: (input: CreateCampfireInput) => void
  setActiveSupplyTab: (tab: SupplyTab) => void
  sendMessage: (content: string) => void
  tick: () => void
  bumpActivity: (roomId?: string) => void
}
