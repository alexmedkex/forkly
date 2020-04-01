import { useEffect, useState } from 'react'

// it will trigger the callback once the toggle change back to false
export const useToggle = (guard: boolean, callback) => {
  const [currentGuard, updateGuard] = useState<boolean>(guard)

  useEffect(
    () => {
      if (guard !== currentGuard) {
        if (guard === false) {
          callback()
        }
        updateGuard(guard)
      }
    },
    [guard]
  )
}
