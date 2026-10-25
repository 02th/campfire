import {
  Mic,
  MicOff,
  ScreenShare,
  Volume2,
  Waves,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { useCampfireStore } from '../../store/useCampfireStore'
import { SoundscapeMixer } from './SoundscapeMixer'

type AudioContextWithSinkId = AudioContext & {
  setSinkId?: (deviceId: string) => Promise<void>
}

export function BottomVoiceDock() {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const profile = useCampfireStore((state) => state.profile)
  const updateProfile = useCampfireStore((state) => state.updateProfile)
  const setActiveSupplyTab = useCampfireStore((state) => state.setActiveSupplyTab)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null

  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [micLoading, setMicLoading] = useState(false)
  const [micError, setMicError] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [speakerError, setSpeakerError] = useState('')
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [screenError, setScreenError] = useState('')
  const [mixerOpen, setMixerOpen] = useState(false)

  const profileRef = useRef(profile)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micContextRef = useRef<AudioContext | null>(null)
  const micFrameRef = useRef(0)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const previewRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    const openMixer = () => setMixerOpen(true)
    window.addEventListener('campfire:open-soundscape', openMixer)
    return () => window.removeEventListener('campfire:open-soundscape', openMixer)
  }, [])

  const toggleMicrophone = useCallback(async () => {
    setMicError('')
    const existing = micStreamRef.current
    if (existing) {
      const nextMuted = !profileRef.current.muted
      existing.getAudioTracks().forEach((track) => { track.enabled = !nextMuted })
      updateProfile({ muted: nextMuted })
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone capture is not supported in this browser.')
      return
    }

    setMicLoading(true)
    try {
      const current = profileRef.current
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(current.inputDeviceId ? { deviceId: { exact: current.inputDeviceId } } : {}),
          echoCancellation: current.echoCancellation,
          noiseSuppression: current.noiseSuppression,
          autoGainControl: current.autoGainControl,
        },
      })

      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      context.createMediaStreamSource(stream).connect(analyser)
      await context.resume()

      micStreamRef.current = stream
      micContextRef.current = context
      setMicStream(stream)
      stream.getAudioTracks().forEach((track) => { track.enabled = true })
      updateProfile({ muted: false })

      const samples = new Uint8Array(analyser.fftSize)
      const measure = () => {
        if (micStreamRef.current !== stream) return
        analyser.getByteTimeDomainData(samples)
        if (profileRef.current.muted) {
          setMicLevel(0)
        } else {
          let sum = 0
          for (const sample of samples) {
            const value = (sample - 128) / 128
            sum += value * value
          }
          const rms = Math.sqrt(sum / samples.length)
          setMicLevel(Math.min(100, Math.round(rms * 180 * profileRef.current.inputVolume / 100)))
        }
        micFrameRef.current = requestAnimationFrame(measure)
      }
      measure()

      stream.getAudioTracks()[0]?.addEventListener('ended', () => {
        if (micStreamRef.current !== stream) return
        micStreamRef.current = null
        setMicStream(null)
        setMicLevel(0)
        updateProfile({ muted: true })
        void context.close()
        micContextRef.current = null
      }, { once: true })
    } catch (error) {
      setMicError(error instanceof Error ? error.message : 'Could not access the microphone.')
      updateProfile({ muted: true })
    } finally {
      setMicLoading(false)
    }
  }, [updateProfile])

  useEffect(() => {
    const handler = () => { void toggleMicrophone() }
    window.addEventListener('campfire:toggle-microphone', handler)
    return () => window.removeEventListener('campfire:toggle-microphone', handler)
  }, [toggleMicrophone])

  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = screenStream
  }, [screenStream])

  useEffect(() => () => {
    cancelAnimationFrame(micFrameRef.current)
    micStreamRef.current?.getTracks().forEach((track) => track.stop())
    micStreamRef.current = null
    if (micContextRef.current && micContextRef.current.state !== 'closed') {
      void micContextRef.current.close()
    }
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const testSpeakerOutput = async () => {
    setSpeakerError('')
    let context: AudioContext | null = null
    try {
      context = new AudioContext()
      const sinkContext = context as AudioContextWithSinkId
      const outputDeviceId = profileRef.current.outputDeviceId
      if (outputDeviceId) {
        if (!sinkContext.setSinkId) {
          throw new Error('This browser cannot route audio to a selected output device.')
        }
        await sinkContext.setSinkId(outputDeviceId)
      }
      await context.resume()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const now = context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.value = 660
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, profileRef.current.outputVolume / 100 * 0.12), now + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.onended = () => { void context?.close() }
      oscillator.start(now)
      oscillator.stop(now + 0.33)
    } catch (error) {
      setSpeakerError(error instanceof Error ? error.message : 'Could not play the speaker test.')
      if (context && context.state !== 'closed') void context.close()
    }
  }

  const toggleScreenShare = async () => {
    setScreenError('')
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
      setScreenStream(null)
      updateProfile({ screenSharing: false, screenStream: null })
      return
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setScreenError('Screen sharing is not supported by this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStreamRef.current = stream
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (screenStreamRef.current !== stream) return
        screenStreamRef.current = null
        setScreenStream(null)
        updateProfile({ screenSharing: false, screenStream: null })
      }, { once: true })
      setScreenStream(stream)
      updateProfile({ screenSharing: true, screenStream: stream })
      setActiveSupplyTab('live-stage')
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Could not start screen sharing.')
    }
  }

  const micActive = Boolean(micStream && !profile.muted)
  const remoteMembers = room?.participants.filter((participant) => participant.id !== 'you') ?? []

  return (
    <div className="flex h-full w-full items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 border-r border-white/[0.1] pr-4">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', micActive ? 'bg-emerald-400' : 'bg-neutral-600')} />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">{room ? 'Audio · ' + room.name : 'Audio devices'}</p>
          <p className="truncate text-[10px] text-neutral-500">
            {micActive ? 'Microphone active · local input (' + micLevel + '%)' : micStream ? 'Microphone muted' : 'Microphone off · local preview'}
          </p>
        </div>
        <div className="hidden min-w-0 items-center gap-1.5 xl:flex">
          {remoteMembers.slice(0, 4).map((participant) => (
            <span key={participant.id} title={participant.name} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[9px] font-semibold text-white" style={{ backgroundColor: participant.avatarColor }}>
              {participant.name.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1.5">
        <button
          type="button"
          title="Open Soundscape Studio"
          aria-label="Open Soundscape Studio"
          aria-pressed={mixerOpen}
          onClick={() => setMixerOpen((value) => !value)}
          className={cn('rounded-lg border p-2 transition-colors hover:bg-white/[0.06]', mixerOpen ? 'border-white/20 bg-white/[0.08] text-white' : 'border-transparent text-neutral-400 hover:text-white')}
        >
          <Waves className="h-4 w-4" />
        </button>
        <button
          type="button"
          title={micStream ? profile.muted ? 'Unmute microphone' : 'Mute microphone' : 'Enable microphone'}
          aria-label={micStream ? profile.muted ? 'Unmute microphone' : 'Mute microphone' : 'Enable microphone'}
          aria-pressed={micActive}
          disabled={micLoading}
          onClick={() => { void toggleMicrophone() }}
          className={cn('rounded-lg border p-2 transition-colors disabled:cursor-wait disabled:opacity-50', micActive ? 'border-white bg-white text-[#09090B]' : 'border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white')}
        >
          {micLoading ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          title="Test speaker output"
          aria-label="Test speaker output"
          onClick={() => { void testSpeakerOutput() }}
          className="rounded-lg border border-transparent p-2 text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title={screenStream ? 'Stop screen share' : 'Share screen'}
          aria-label={screenStream ? 'Stop screen share' : 'Share screen'}
          aria-pressed={Boolean(screenStream)}
          onClick={() => { void toggleScreenShare() }}
          className={cn('relative rounded-lg border p-2 transition-colors', screenStream ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white')}
        >
          <ScreenShare className="h-4 w-4" />
        </button>
      </div>
      {(micError || speakerError || screenError) && (
        <p className="max-w-48 truncate text-[10px] text-red-300" role="status" title={[micError, speakerError, screenError].filter(Boolean).join(' · ')}>
          {[micError, speakerError, screenError].filter(Boolean)[0]}
        </p>
      )}
      <SoundscapeMixer open={mixerOpen} onClose={() => setMixerOpen(false)} />
    </div>
  )
}
