declare module 'liquid-gl' {
  export type LiquidGLEngine = 'auto' | 'webgpu' | 'webgl2' | 'webgl'

  export interface LiquidGLOptions {
    target: string
    snapshot?: string
    engine?: LiquidGLEngine
    zIndex?: number
    reveal?: 'fade' | 'none'
    refraction?: number
    bevelDepth?: number
    bevelWidth?: number
    frost?: number
    shadow?: boolean
    specular?: boolean
    tint?: string
  }

  export interface LiquidGLInstance {
    destroy?: () => void
  }

  export interface LiquidGLFactory {
    (options: LiquidGLOptions): LiquidGLInstance | LiquidGLInstance[] | undefined
    registerDynamic(elements: string | Element[]): void
  }

  const liquidGL: LiquidGLFactory
  export default liquidGL
}
