import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  LayoutColumn,
  LayoutPanel,
  LayoutRow,
  LayoutSnapshot,
  LayoutStore,
} from '../types/layout'

const STORAGE_KEY = 'campfire-layout-v1'

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function deepClone<T>(value: T): T {
  return structuredClone(value)
}

export function buildDefaultLayout(): LayoutSnapshot {
  const panels: Record<string, LayoutPanel> = {
    radar: {
      id: 'radar',
      kind: 'radar',
      label: 'Radar Sidebar',
      hidden: false,
      minimized: false,
    },
    header: {
      id: 'header',
      kind: 'header',
      label: 'Top Header',
      hidden: false,
      minimized: false,
    },
    supply: {
      id: 'supply',
      kind: 'supply',
      label: 'Supply Dock',
      hidden: false,
      minimized: false,
    },
    voice: {
      id: 'voice',
      kind: 'voice',
      label: 'Voice Dock',
      hidden: false,
      minimized: false,
    },
    chat: {
      id: 'chat',
      kind: 'chat',
      label: 'Chat Sidebar',
      hidden: false,
      minimized: false,
    },
  }

  const columns: LayoutColumn[] = [
    {
      id: 'col_left',
      width: 'sidebar',
      rows: [{ id: 'row_radar', panelIds: ['radar'], grow: true }],
    },
    {
      id: 'col_center',
      width: 'flex',
      rows: [
        { id: 'row_header', panelIds: ['header'], grow: false },
        { id: 'row_supply', panelIds: ['supply'], grow: true },
        { id: 'row_voice', panelIds: ['voice'], grow: false },
      ],
    },
    {
      id: 'col_right',
      width: 'chat',
      rows: [{ id: 'row_chat', panelIds: ['chat'], grow: true }],
    },
  ]

  return { columns, panels }
}

function findPanelLocation(
  columns: LayoutColumn[],
  panelId: string,
): { colIndex: number; rowIndex: number; paneIndex: number } | null {
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const col = columns[colIndex]
    for (let rowIndex = 0; rowIndex < col.rows.length; rowIndex++) {
      const paneIndex = col.rows[rowIndex].panelIds.indexOf(panelId)
      if (paneIndex !== -1) {
        return { colIndex, rowIndex, paneIndex }
      }
    }
  }
  return null
}

function pruneEmptyColumns(columns: LayoutColumn[]): LayoutColumn[] {
  return columns.filter((col) => col.rows.length > 0)
}

function removePanelFromTree(
  columns: LayoutColumn[],
  panelId: string,
): LayoutColumn[] {
  return pruneEmptyColumns(
    columns.map((col) => ({
      ...col,
      rows: col.rows
        .map((row) => ({
          ...row,
          panelIds: row.panelIds.filter((id) => id !== panelId),
        }))
        .filter((row) => row.panelIds.length > 0),
    })),
  )
}

function insertRowInColumn(
  columns: LayoutColumn[],
  colIndex: number,
  row: LayoutRow,
  at: 'start' | 'end' = 'end',
): LayoutColumn[] {
  return columns.map((col, i) => {
    if (i !== colIndex) return col
    return {
      ...col,
      rows: at === 'start' ? [row, ...col.rows] : [...col.rows, row],
    }
  })
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      ...buildDefaultLayout(),
      customizeMode: false,

      setCustomizeMode: (enabled) => set({ customizeMode: enabled }),

      toggleCustomizeMode: () =>
        set((s) => ({ customizeMode: !s.customizeMode })),

      movePanel: (panelId, direction) => {
        const state = get()
        const panel = state.panels[panelId]
        if (!panel || panel.hidden) return

        const loc = findPanelLocation(state.columns, panelId)
        if (!loc) return

        let columns = deepClone(state.columns)
        const sourceRow = columns[loc.colIndex].rows[loc.rowIndex]
        const isSplit = sourceRow.panelIds.length > 1

        // Within a split row: shuffle panes left/right first
        if (isSplit) {
          const ids = [...sourceRow.panelIds]
          const swapWith =
            direction === 'left' ? loc.paneIndex - 1 : loc.paneIndex + 1
          if (swapWith >= 0 && swapWith < ids.length) {
            ;[ids[loc.paneIndex], ids[swapWith]] = [
              ids[swapWith],
              ids[loc.paneIndex],
            ]
            columns[loc.colIndex].rows[loc.rowIndex] = {
              ...sourceRow,
              panelIds: ids,
            }
            set({ columns })
            return
          }
        }

        const movingGrow =
          (sourceRow.grow && !isSplit) ||
          panel.kind === 'radar' ||
          panel.kind === 'chat' ||
          panel.kind === 'supply'

        // Capture target column id before mutating the tree
        let targetColId: string
        if (direction === 'left' && loc.colIndex === 0) {
          targetColId = uid('col')
          columns = [
            { id: targetColId, width: 'sidebar', rows: [] },
            ...columns,
          ]
        } else if (
          direction === 'right' &&
          loc.colIndex === columns.length - 1
        ) {
          targetColId = uid('col')
          columns = [
            ...columns,
            { id: targetColId, width: 'sidebar', rows: [] },
          ]
        } else {
          const neighborIndex =
            direction === 'left' ? loc.colIndex - 1 : loc.colIndex + 1
          targetColId = columns[neighborIndex].id
        }

        columns = removePanelFromTree(columns, panelId)

        // Edge column may have been the only content — recreate if pruned
        let targetColIndex = columns.findIndex((c) => c.id === targetColId)
        if (targetColIndex === -1) {
          const fresh = { id: targetColId, width: 'sidebar' as const, rows: [] }
          columns =
            direction === 'left' ? [fresh, ...columns] : [...columns, fresh]
          targetColIndex = direction === 'left' ? 0 : columns.length - 1
        }

        const newRow: LayoutRow = {
          id: uid('row'),
          panelIds: [panelId],
          grow: movingGrow,
        }

        columns = insertRowInColumn(
          columns,
          targetColIndex,
          newRow,
          direction === 'left' ? 'end' : 'start',
        )

        set({ columns: pruneEmptyColumns(columns) })
      },

      splitPane: (panelId) => {
        const state = get()
        const loc = findPanelLocation(state.columns, panelId)
        if (!loc) return

        const customId = uid('custom')
        const columns = deepClone(state.columns)
        const row = columns[loc.colIndex].rows[loc.rowIndex]

        if (row.panelIds.length >= 3) return

        row.panelIds = [...row.panelIds, customId]
        columns[loc.colIndex].rows[loc.rowIndex] = row

        set({
          columns,
          panels: {
            ...state.panels,
            [customId]: {
              id: customId,
              kind: 'custom',
              label: 'Custom Slot',
              hidden: false,
              minimized: false,
            },
          },
        })
      },

      toggleMinimize: (panelId) => {
        const panel = get().panels[panelId]
        if (!panel || panel.hidden) return

        // Cycle: normal → minimized → hidden
        if (!panel.minimized) {
          set({
            panels: {
              ...get().panels,
              [panelId]: { ...panel, minimized: true },
            },
          })
          return
        }

        // Second press while minimized → hide
        get().hidePanel(panelId)
      },

      hidePanel: (panelId) => {
        const state = get()
        const panel = state.panels[panelId]
        if (!panel) return

        set({
          columns: removePanelFromTree(state.columns, panelId),
          panels: {
            ...state.panels,
            [panelId]: { ...panel, hidden: true, minimized: false },
          },
        })
      },

      restorePanel: (panelId) => {
        const state = get()
        const panel = state.panels[panelId]
        if (!panel || !panel.hidden) return

        // Prefer center column; fall back to last column
        let columns = deepClone(state.columns)
        let centerIdx = columns.findIndex((c) => c.width === 'flex')
        if (centerIdx === -1) {
          columns = [
            ...columns,
            { id: uid('col'), width: 'flex', rows: [] },
          ]
          centerIdx = columns.length - 1
        }

        const grow =
          panel.kind === 'radar' ||
          panel.kind === 'chat' ||
          panel.kind === 'supply' ||
          panel.kind === 'custom'

        columns = insertRowInColumn(columns, centerIdx, {
          id: uid('row'),
          panelIds: [panelId],
          grow,
        })

        set({
          columns,
          panels: {
            ...state.panels,
            [panelId]: { ...panel, hidden: false, minimized: false },
          },
        })
      },

      addCustomSlot: (anchorPanelId) => {
        const state = get()
        const loc = findPanelLocation(state.columns, anchorPanelId)
        if (!loc) return

        const customId = uid('custom')
        const columns = deepClone(state.columns)
        const newRow: LayoutRow = {
          id: uid('row'),
          panelIds: [customId],
          grow: true,
        }

        columns[loc.colIndex].rows.splice(loc.rowIndex + 1, 0, newRow)

        set({
          columns,
          panels: {
            ...state.panels,
            [customId]: {
              id: customId,
              kind: 'custom',
              label: 'Custom Slot',
              hidden: false,
              minimized: false,
            },
          },
        })
      },

      resetLayout: () => {
        const defaults = buildDefaultLayout()
        set({
          ...defaults,
          customizeMode: get().customizeMode,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        columns: state.columns,
        panels: state.panels,
      }),
    },
  ),
)

export function selectHiddenPanels(state: LayoutStore): LayoutPanel[] {
  return Object.values(state.panels).filter((p) => p.hidden)
}
