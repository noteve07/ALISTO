import { useEffect, useRef, useState } from 'react'

export const useScrollAnimation = (threshold = 0.2) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
          setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [elementRef, isVisible]
}
