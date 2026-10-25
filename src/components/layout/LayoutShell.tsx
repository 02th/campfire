import { BottomVoiceDock } from './BottomVoiceDock'
import { CustomPanelSlot } from './CustomPanelSlot'
import { PanelFrame } from './PanelFrame'
import { RadarSidebar } from './RadarSidebar'
import { RightChatSidebar } from './RightChatSidebar'
import { TopBurnHeader } from './TopBurnHeader'
import { SupplyDock } from '../supplies/SupplyDock'
import { cn } from '../../lib/cn'
import { useLayoutStore } from '../../store/useLayoutStore'
import type { BuiltinPanelKind, LayoutColumn } from '../../types/layout'

const COLUMN_WIDTH: Record<LayoutColumn['width'], string> = {
  sidebar: 'w-64 shrink-0',
  chat: 'w-72 shrink-0',
  flex: 'min-w-0 flex-1',
}

function renderPanelBody(kind: BuiltinPanelKind, label: string) {
  switch (kind) {
    case 'radar':
      return <RadarSidebar />
    case 'header':
      return <TopBurnHeader />
    case 'supply':
      return <SupplyDock />
    case 'voice':
      return <BottomVoiceDock />
    case 'chat':
      return <RightChatSidebar />
    case 'custom':
      return <CustomPanelSlot label={label} />
  }
}

export function LayoutShell() {
  const columns = useLayoutStore((s) => s.columns)
  const panels = useLayoutStore((s) => s.panels)
  const customizeMode = useLayoutStore((s) => s.customizeMode)

  return (
    <div
      className={cn(
        'app-shell flex h-full w-full text-white',
        customizeMode && 'customize-layout-active',
      )}
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            'flex h-full min-h-0 flex-col',
            COLUMN_WIDTH[column.width],
            customizeMode && column.width !== 'flex' && 'relative',
          )}
        >
          {column.rows.map((row) => {
            const visibleIds = row.panelIds.filter(
              (id) => panels[id] && !panels[id].hidden,
            )
            if (visibleIds.length === 0) return null

            const rowGrow =
              row.grow && visibleIds.some((id) => !panels[id]?.minimized)

            return (
              <div
                key={row.id}
                className={cn(
                  'flex min-h-0 min-w-0',
                  rowGrow ? 'flex-1' : 'shrink-0',
                  visibleIds.length > 1 ? 'flex-row' : 'flex-col',
                )}
              >
                {visibleIds.map((panelId) => {
                  const panel = panels[panelId]
                  if (!panel) return null
                  return (
                    <PanelFrame
                      key={panelId}
                      panelId={panelId}
                      grow={rowGrow || visibleIds.length > 1}
                      className={cn(
                        visibleIds.length > 1 && 'flex-1 border-r border-white/10 last:border-r-0',
                        // Side panels should stretch full column height when alone
                        visibleIds.length === 1 &&
                          rowGrow &&
                          'flex h-full flex-col',
                      )}
                    >
                      <div
                        className={cn(
                          'h-full min-h-0',
                          (panel.kind === 'supply' ||
                            panel.kind === 'radar' ||
                            panel.kind === 'chat' ||
                            panel.kind === 'custom') &&
                            'flex flex-col',
                        )}
                      >
                        {renderPanelBody(panel.kind, panel.label)}
                      </div>
                    </PanelFrame>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
