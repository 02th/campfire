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

    // Share one renderer across the shell, and explicitly track content that changes
    // when the active workspace tab changes. WebGL2 avoids the Dawn/WebGPU texture
    // validation error seen on some Chromium builds.
    let lenses: LiquidGlassLens[] = []
    try {
      const glass = liquidGL({
        target: '.liquid-glass',
        snapshot: 'body',
        engine: 'webgl2',
        zIndex: 20,
        reveal: 'none',
        refraction: 0.008,
        bevelDepth: 0.08,
        bevelWidth: 0.12,
        frost: 0.28,
        shadow: true,
        specular: true,
        tint: 'rgba(12, 12, 18, 0.16)',
      })

      lenses = glass
        ? Array.isArray(glass)
          ? (glass as unknown as LiquidGlassLens[])
          : [glass as unknown as LiquidGlassLens]
        : []

      // React replaces this region when workspace tabs change; register it so the
      // captured texture follows the current content rather than retaining old frames.
      liquidGL.registerDynamic('.liquid-glass-dynamic')
    } catch (error) {
      // Keep the existing CSS glass styling if GPU initialization fails.
      console.error('liquid-gl initialization failed; keeping CSS glass fallback.', error)
    }

    return () => {
      lenses.forEach((lens) => lens.destroy?.())
      lenses = []
    }
  }, [])

  return (
    <>
      <div className={`sticky top-0 h-screen w-screen overflow-hidden flex bg-[#070709] text-[#F4F4F6] select-none ${profile.reducedMotion ? 'reduce-motion' : ''} ${profile.highContrastBorders ? 'high-contrast' : ''}`}>
        {/* Left Rail: Radar Sidebar */}
        <aside className="liquid-glass relative z-20 w-[260px] shrink-0 h-full flex flex-col bg-[#0B0B0E]/90 backdrop-blur-2xl border-r border-white/[0.07]">
          <RadarSidebar />
        </aside>

        {/* Center Stage */}
        <div className="flex-1 min-w-0 h-full flex flex-col bg-[#070709] relative">
          {/* Top Burn Header */}
          <header className="liquid-glass relative z-20 h-[52px] shrink-0 px-5 flex items-center justify-between border-b border-white/[0.07] bg-[#0B0B0E]/75 backdrop-blur-xl">
            <TopBurnHeader />
          </header>

          {/* Supply Dock */}
          <main className="liquid-glass-dynamic flex-1 min-h-0 flex flex-col overflow-hidden">
            <SupplyDock />
          </main>

          {/* Bottom Voice Dock */}
          <footer className="liquid-glass relative z-20 h-[58px] shrink-0 px-4 flex items-center justify-between border-t border-white/[0.07] bg-[#0B0B0E]/90 backdrop-blur-2xl">
            <BottomVoiceDock />
          </footer>
        </div>

        {/* Right Rail: Chat Sidebar */}
        <aside className="liquid-glass relative z-20 w-[310px] shrink-0 h-full flex flex-col bg-[#0B0B0E]/90 backdrop-blur-2xl border-l border-white/[0.07]">
          <RightChatSidebar />
        </aside>
      </div>
      <CreateCampfireModal />
    </>
  )
}
