import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useCampfireStore } from '../../store/useCampfireStore'

const SUBJECTS = ['Calculus & Math', 'Organic Chemistry', 'Physics (NEET/JEE)', 'Nutritional Biochem', 'DSA & Algorithms']
export function Solvely({ onWhiteboard }: { onWhiteboard: () => void }) {
  const rooms = useCampfireStore((state) => state.rooms)
  const activeRoomId = useCampfireStore((state) => state.activeRoomId)
  const profile = useCampfireStore((state) => state.profile)
  const setSolverQuestion = useCampfireStore((state) => state.setSolverQuestion)
  const saveSolverLesson = useCampfireStore((state) => state.saveSolverLesson)
  const setStudyContent = useCampfireStore((state) => state.setStudyContent)
  const room = rooms.find((item) => item.id === activeRoomId) ?? null
  const [subject, setSubject] = useState(SUBJECTS[4])
  const [image, setImage] = useState('')
  const [solving, setSolving] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [mode, setMode] = useState<'solve' | 'study'>('solve')
  const [cardIndex, setCardIndex] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState<number[]>([])
  const [modelError, setModelError] = useState('')
  const [imageError, setImageError] = useState('')
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const lesson = room?.solverLesson
  const cards = room?.studyCards ?? []

  const loadImage = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setImageError('Please choose an image file.'); return }
    setImageError('')
    const reader = new FileReader()
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); loadImage(event.dataTransfer.files[0]) }
  const onUpload = (event: ChangeEvent<HTMLInputElement>) => loadImage(event.target.files?.[0])
  const solve = async () => {
    const prompt = room?.solverQuestion.trim()
    if (!prompt) return
    if (!profile.aiBaseUrl.trim()) {
      setModelError('Set an OpenAI-compatible endpoint in Settings → AI Endpoint to use Solver.')
      return
    }

    setSolving(true)
    setModelError('')
    try {
      const response = await fetch(profile.aiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          model: profile.aiModel || 'auto',
          messages: [
            { role: 'system', content: 'You are a careful tutor for ' + subject + '. Answer as JSON with concept, formula, steps (array of title/content/why), and finalAnswer. Do not invent problem values.' },
            { role: 'user', content: image
              ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image } }]
              : prompt },
          ],
        }),
      })
      if (!response.ok) throw new Error('Model endpoint returned HTTP ' + response.status + '.')
      const payload: unknown = await response.json()
      const content = payload && typeof payload === 'object' && 'choices' in payload
        ? ((payload as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? '')
        : ''
      const parsed = JSON.parse(content) as {
        concept?: string
        formula?: string
        finalAnswer?: string
        steps?: { title: string; content: string; why: string }[]
      }
      const validSteps = Array.isArray(parsed.steps)
        ? parsed.steps.filter((step) => typeof step.title === 'string' && typeof step.content === 'string' && typeof step.why === 'string')
        : []
      if (!parsed.concept || !parsed.formula || !parsed.finalAnswer || validSteps.length === 0) {
        throw new Error('Model response was incomplete.')
      }
      saveSolverLesson({
        question: prompt,
        concept: parsed.concept,
        formula: parsed.formula,
        steps: validSteps,
        finalAnswer: parsed.finalAnswer,
        source: 'local model',
      })
    } catch (error) {
      setModelError(error instanceof Error ? error.message : 'The model request failed.')
    } finally {
      setSolving(false)
    }
  }
  const generateStudy = () => {
    if (!lesson) {
      setModelError('Solve a question first to generate study cards.')
      setMode('solve')
      return
    }
    setModelError('')
    setStudyContent(
      [
        { question: 'Core concept', answer: lesson.concept },
        { question: 'Formula or principle', answer: lesson.formula },
        { question: 'Conclusion', answer: lesson.finalAnswer },
      ],
      [],
    )
    setMode('study')
    setKnownCards([])
    setCardIndex(0)
    setCardFlipped(false)
  }
  const sendToBoard = () => {
    if (!lesson) return
    onWhiteboard()
  }

  if (!room) return <div className="p-6 text-sm text-neutral-500">Select a room to study.</div>
  return <section className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
    <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Solver</h2><p className="text-xs text-neutral-500">Use your configured model endpoint for worked explanations.</p></div><div className="flex gap-1"><button onClick={() => setMode('solve')} className={`rounded px-3 py-1.5 text-xs ${mode === 'solve' ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>Solve</button><button onClick={() => setMode('study')} className={`rounded px-3 py-1.5 text-xs ${mode === 'study' ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>Study cards</button></div></div>
    {mode === 'solve' ? <>
      <div className="mb-3 flex flex-wrap gap-2">{SUBJECTS.map((item) => <button key={item} onClick={() => setSubject(item)} className={`rounded-full border px-3 py-1.5 text-[10px] ${item === subject ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-neutral-400'}`}>{item}</button>)}</div>
      <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onPaste={(event) => { const item = Array.from(event.clipboardData.items).find((clipboardItem) => clipboardItem.type.startsWith('image/')); if (item) loadImage(item.getAsFile() ?? undefined) }} className="mb-3 flex min-h-20 items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3">
        <div><p className="text-xs text-neutral-300">Drop or upload a problem image</p><p className="mt-1 text-[10px] text-neutral-600">Images stay in this browser session.</p></div>
        <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-[10px] text-neutral-300">Upload<input type="file" accept="image/*" onChange={onUpload} className="hidden" /></label>
      </div>
      {imageError && <p role="alert" className="mb-2 text-[10px] text-red-300">{imageError}</p>}
      {image && <div className="mb-3 flex items-start gap-3"><img src={image} alt="Uploaded problem" className="max-h-36 max-w-48 rounded-lg border border-white/10 object-contain" /><button onClick={() => setImage('')} className="text-xs text-neutral-500">Remove image</button></div>}
      <textarea ref={questionRef} value={room.solverQuestion} onChange={(event) => setSolverQuestion(event.target.value)} placeholder={`Describe your ${subject.toLowerCase()} question…`} className="glass-input min-h-20 resize-y rounded-xl p-3 text-sm text-white outline-none placeholder:text-neutral-600" />
      <div className="mt-3 flex flex-wrap gap-2"><button disabled={!room.solverQuestion.trim() || solving} onClick={() => void solve()} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-40">{solving ? 'Solving…' : 'Solve step by step'}</button><button onClick={generateStudy} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-300">Generate study cards</button></div>
      {modelError && <p role="status" className="mt-2 text-[10px] text-amber-300">{modelError}</p>}
      {lesson && <article className="mt-5 space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <div><p className="text-[10px] uppercase tracking-wider text-neutral-500">Core concept · {lesson.source}</p><p className="mt-1 text-sm text-neutral-200">{lesson.concept}</p></div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] p-3"><p className="text-[10px] uppercase tracking-wider text-emerald-300">Formula or principle</p><p className="mt-1 font-mono text-xs text-neutral-200">{lesson.formula}</p></div>
        {lesson.steps.map((step, index) => <div key={`${step.title}-${index}`} className="rounded-lg border border-white/[0.07] p-3"><p className="text-xs font-semibold text-white">Step {index + 1} · {step.title}</p><p className="mt-1 text-xs leading-relaxed text-neutral-400">{step.content}</p><button onClick={() => setExpandedStep(expandedStep === index ? null : index)} className="mt-2 text-[10px] text-sky-300">{expandedStep === index ? 'Hide explanation' : 'Explain this step'}</button>{expandedStep === index && <p className="mt-2 border-l border-sky-400/40 pl-2 text-xs text-neutral-300">{step.why}</p>}</div>)}
        <div className="rounded-lg bg-white/[0.06] p-3"><p className="text-xs font-semibold text-white">Final Answer</p><p className="mt-1 text-xs text-neutral-300">{lesson.finalAnswer}</p></div>
        <button onClick={sendToBoard} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-200">Send to Whiteboard</button>
      </article>}
    </> : <div className="min-h-0 flex-1 max-w-2xl">
      <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Flashcards</h3><span className="text-[10px] text-neutral-500">{knownCards.length} known</span></div>{cards.length ? <><button onClick={() => setCardFlipped((value) => !value)} className="flex min-h-36 w-full items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 text-center text-sm text-white [transform-style:preserve-3d]">{cardFlipped ? cards[cardIndex % cards.length].answer : cards[cardIndex % cards.length].question}</button><div className="flex justify-center gap-2"><button onClick={() => { setKnownCards((old) => old.includes(cardIndex) ? old : [...old, cardIndex]); setCardIndex((old) => (old + 1) % cards.length); setCardFlipped(false) }} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-300">Got it</button><button onClick={() => { setCardIndex((old) => (old + 1) % cards.length); setCardFlipped(false) }} className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">Review again</button></div></> : <p className="text-xs text-neutral-500">Solve a question first to create study cards.</p>}</div>

    </div>}
  </section>
}
