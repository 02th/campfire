import { useEffect } from 'react'
import liquidGL from 'liquid-gl'
import { RadarSidebar } from './components/layout/RadarSidebar'
import { TopBurnHeader } from './components/layout/TopBurnHeader'
import { BottomVoiceDock } from './components/layout/BottomVoiceDock'
import { RightChatSidebar } from './components/layout/RightChatSidebar'
import { SupplyDock } from './components/supplies/SupplyDock'
import { CreateCampfireModal } from './components/modals/CreateCampfireModal'
import { startCampfireTicker, useCampfireStore } from './store/useCampfireStore'

type LiquidGlassLens = {
  destroy?: () => void
}

export default function App() {
  const profile = useCampfireStore((state) => state.profile)
  useEffect(() => {
    startCampfireTicker()

    // liquid-gl returns one lens for a single target, but an array for multiple targets.
    // Clean up every lens so React StrictMode's development remount cannot leave duplicates.
    let lenses: LiquidGlassLens[] = []
    try {
      const glass = liquidGL({
        target: '.liquid-glass',
        engine: 'auto',
        refraction: 0.018,
        bevelDepth: 0.08,
        bevelWidth: 0.12,
        frost: 1,
        shadow: true,
        specular: true,
        tint: 'rgba(12, 12, 18, 0.22)',
      })

      lenses = glass
        ? Array.isArray(glass)
          ? (glass as unknown as LiquidGlassLens[])
          : [glass as unknown as LiquidGlassLens]
        : []
    } catch (error) {
      // The CSS glass styling remains usable if the GPU renderer cannot initialize.
      console.error('liquid-gl initialization failed; keeping CSS glass fallback.', error)
    }

    return () => {
      lenses.forEach((lens) => lens.destroy?.())
      lenses = []
    }
  }, [])

  return (
    <>
      <div className={`h-screen w-screen overflow-hidden flex bg-[#070709] text-[#F4F4F6] select-none ${profile.reducedMotion ? 'reduce-motion' : ''} ${profile.highContrastBorders ? 'high-contrast' : ''}`}>
        {/* Left Rail: Radar Sidebar */}
        <aside className="liquid-glass sticky top-0 w-[260px] shrink-0 h-full flex flex-col bg-[#0B0B0E]/90 backdrop-blur-2xl border-r border-white/[0.07]">
          <RadarSidebar />
        </aside>

        {/* Center Stage */}
        <div className="flex-1 min-w-0 h-full flex flex-col bg-[#070709] relative">
          {/* Top Burn Header */}
          <header className="liquid-glass sticky top-0 h-[52px] shrink-0 px-5 flex items-center justify-between border-b border-white/[0.07] bg-[#0B0B0E]/75 backdrop-blur-xl z-10">
            <TopBurnHeader />
          </header>

          {/* Supply Dock */}
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <SupplyDock />
          </main>

          {/* Bottom Voice Dock */}
          <footer className="liquid-glass sticky bottom-0 h-[58px] shrink-0 px-4 flex items-center justify-between border-t border-white/[0.07] bg-[#0B0B0E]/90 backdrop-blur-2xl z-10">
            <BottomVoiceDock />
          </footer>
        </div>

        {/* Right Rail: Chat Sidebar */}
        <aside className="liquid-glass sticky top-0 w-[310px] shrink-0 h-full flex flex-col bg-[#0B0B0E]/90 backdrop-blur-2xl border-l border-white/[0.07]">
          <RightChatSidebar />
        </aside>
      </div>
      <CreateCampfireModal />
    </>
  )
}
