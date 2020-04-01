import { history } from '../../../store'

export const goBackOrFallBackTo = ({
  defaultHistoryLength = 4, // In KOMGO initial history.length is by default 4 because the login redirects and route configuration
  fallbackURL
}: {
  defaultHistoryLength?: number
  fallbackURL: string
}) => {
  // WORKAROUND check if the history length is the default defaultHistoryLength
  // TODO LS remove anything that mimic browser behaviors (e.g. back). This approach is fragile
  if (history.length <= defaultHistoryLength) {
    history.push(fallbackURL)
  } else {
    history.goBack()
  }
}
