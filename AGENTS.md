# CAMPFIRE — CURSOR AGENT RULES & ARCHITECTURE

## 1. Project Overview

Campfire is a desktop/web social workspace where micro-community rooms ("Campfires") self-destruct on custom timers `countdown`, `deadman`, `pomodoro`) and feature an embedded multi-tab "Supply Dock" (VS Code Monaco editor with Piston API code execution, GitHub repo loader, Collaborative Whiteboard/Study Canvas, Synced Pomodoro + Web Audio Brown Noise, and WebRTC Voice/Screen Share).

## 2. Strict Tech Stack & Conventions

- **Framework:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide React icons.

- **State Management:** Use a centralized `zustand` store `src/store/useCampfireStore.ts`) so the Radar, Top Timer Header, Center Supply Dock, Voice Bar, and Chat Sidebar stay 100% synced.

- **UI Palette:** Premium Black & White Liquid Glass — deep obsidian backgrounds `#000000` / `#080808`), frosted glass panels (`bg-white/[0.03]` or `bg-black/[0.4]` + `backdrop-blur-xl` + `border-white/10` + inner highlights), crisp monochrome typography (`text-white` / `text-neutral-400`), glowing white accents (replacing ember orange), glass hover states (`hover:bg-white/[0.07]`, `hover:border-white/25`). Utility classes: `.glass-panel`, `.glass-card`, `.glass-btn`, `.glass-btn-primary`, `.ember-glow`, `.timer-glow`.

- **No Dead Buttons:** Every button MUST work immediately in local state (even before Supabase keys are added). Use realistic default rooms and local fallbacks so the app is 100% playable out of the box.

## 3. Folder Structure to Maintain

- `src/types/campfire.ts` -> All TypeScript interfaces for Rooms, Timers, Supplies, Messages.

- `src/store/useCampfireStore.ts` -> Global Zustand state, live countdown tick logic, "+ Add Fuel" (+30m) action, and room creation.

- `src/components/layout/` -> `RadarSidebar.tsx`, `TopBurnHeader.tsx`, `BottomVoiceDock.tsx`, `RightChatSidebar.tsx`.

- `src/components/supplies/` -> `SupplyDock.tsx`, `DevRigTab.tsx` (Monaco + Piston API + GitHub), `StudyBoardTab.tsx` (Canvas + Pomodoro + Brown Noise), `ScreenShareTab.tsx` (WebRTC `getDisplayMedia`).

- `src/components/modals/` -> `CreateCampfireModal.tsx`, `EmberRecapModal.tsx` (shown when timer hits 00:00:00).