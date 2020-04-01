import { IMailToData } from '../store/types'

export const openDefaultMailClientWithDataPopulated = (data: IMailToData) => {
  const mailToLink = `mailto:${data.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(
    data.body
  )}`
  window.location.href = mailToLink
}
