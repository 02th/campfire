/** Built-in shell panels that can be rearranged in Customize Layout mode. */
export type BuiltinPanelKind =
  | 'radar'
  | 'header'
  | 'supply'
  | 'voice'
  | 'chat'
  | 'custom'

export type ColumnWidth = 'sidebar' | 'flex' | 'chat'

export interface LayoutPanel {
  id: string
  kind: BuiltinPanelKind
  label: string
  /** Fully removed from the shell until restored. */
  hidden: boolean
  /** Collapsed to a thin strip. */
  minimized: boolean
}

/** A horizontal split row: one or more panels side-by-side. */
export interface LayoutRow {
  id: string
  panelIds: string[]
  /** Grow to fill remaining vertical space in the column. */
  grow: boolean
}

export interface LayoutColumn {
  id: string
  width: ColumnWidth
  rows: LayoutRow[]
}

export interface LayoutSnapshot {
  columns: LayoutColumn[]
  panels: Record<string, LayoutPanel>
}

export interface LayoutStore extends LayoutSnapshot {
  customizeMode: boolean
  setCustomizeMode: (enabled: boolean) => void
  toggleCustomizeMode: () => void
  movePanel: (panelId: string, direction: 'left' | 'right') => void
  splitPane: (panelId: string) => void
  toggleMinimize: (panelId: string) => void
  hidePanel: (panelId: string) => void
  restorePanel: (panelId: string) => void
  addCustomSlot: (anchorPanelId: string) => void
  resetLayout: () => void
}
