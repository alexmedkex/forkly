import scrollIntoView from 'scroll-into-view'
import { history } from '../../../store/history'
import { SIZES } from '../../../utils/media'

export const scrollTo = (selector: string) => {
  const isMobile = window.innerWidth < SIZES.desktop

  if (isMobile) {
    return
  }

  const target = document.querySelector(selector)
  scrollIntoView(target, { time: 500, align: { top: 0.1 } })
}
