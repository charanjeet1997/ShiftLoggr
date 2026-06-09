import { useEffect, useState } from 'react'

// Tailwind default breakpoints.
const MD = 640
const LG = 1024

export interface Breakpoint {
  isMobile: boolean // < 640
  isTablet: boolean // 640–1024
  isDesktop: boolean // > 1024
  width: number
}

function read(): Breakpoint {
  const width = typeof window === 'undefined' ? 1280 : window.innerWidth
  return {
    isMobile: width < MD,
    isTablet: width >= MD && width < LG,
    isDesktop: width >= LG,
    width,
  }
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(read)

  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setBp(read()))
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return bp
}
