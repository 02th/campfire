import { LayoutTemplate } from 'lucide-react'

interface CustomPanelSlotProps {
  label?: string
}

export function CustomPanelSlot({ label = 'Custom Slot' }: CustomPanelSlotProps) {
  return (
    <div className="glass-panel flex h-full min-h-[8rem] w-full flex-col items-center justify-center gap-2 rounded-none border-dashed border-white/20 bg-white/[0.02] px-4 text-center">
      <LayoutTemplate className="h-6 w-6 text-neutral-500" />
      <p className="text-sm font-medium text-neutral-300">{label}</p>
      <p className="max-w-[14rem] text-[11px] leading-relaxed text-neutral-500">
        Empty panel slot — drop tools here later, or keep it as breathing room.
      </p>
    </div>
  )
}
