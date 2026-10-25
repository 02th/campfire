import { useEffect } from 'react'
import { LayoutShell } from './components/layout/LayoutShell'
import { CreateCampfireModal } from './components/modals/CreateCampfireModal'
import { startCampfireTicker } from './store/useCampfireStore'
import { useLayoutStore } from './store/useLayoutStore'
import { Eye, LayoutDashboard, RotateCcw } from 'lucide-react'

/** Escape hatch when the header panel is hidden — still reach layout controls. */
function LayoutEscapeHatch() {
  const customizeMode = useLayoutStore((s) => s.customizeMode)
  const header = useLayoutStore((s) => s.panels.header)
  const toggleCustomizeMode = useLayoutStore((s) => s.toggleCustomizeMode)
  const resetLayout = useLayoutStore((s) => s.resetLayout)
  const restorePanel = useLayoutStore((s) => s.restorePanel)

  if (header && !header.hidden) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/80 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {header?.hidden && (
        <button
          type="button"
          title="Restore Top Header"
          onClick={() => restorePanel('header')}
          className="rounded-lg p-2 text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        title="Reset to Default"
        onClick={resetLayout}
        className="rounded-lg p-2 text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        title={customizeMode ? 'Done customizing' : 'Customize Layout'}
        onClick={toggleCustomizeMode}
        className={
          customizeMode
            ? 'rounded-lg bg-white/15 p-2 text-white'
            : 'rounded-lg p-2 text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white'
        }
      >
        <LayoutDashboard className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    startCampfireTicker()
  }, [])

  return (
    <>
      <LayoutShell />
      <LayoutEscapeHatch />
      <CreateCampfireModal />
    </>
  )
}
