import { useEffect, useRef, useState } from 'react'

const TOP_THRESHOLD = 12
const DELTA_MIN = 6
const HIDE_AFTER = 56

/**
 * True when the nav should be visible: near top of page or user scrolled up.
 * Hides after scrolling down past HIDE_AFTER px (typical “read content” gesture).
 */
export function useNavbarScrollVisible() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      if (raf.current) {
        return
      }
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        const y = window.scrollY
        const delta = y - lastY.current
        lastY.current = y

        if (y <= TOP_THRESHOLD) {
          setVisible(true)
          return
        }
        if (Math.abs(delta) < DELTA_MIN) {
          return
        }
        if (delta > 0 && y > HIDE_AFTER) {
          setVisible(false)
        } else if (delta < 0) {
          setVisible(true)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf.current) {
        cancelAnimationFrame(raf.current)
      }
    }
  }, [])

  return visible
}
