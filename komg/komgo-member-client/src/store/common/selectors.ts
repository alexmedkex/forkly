import { Map as ImmutableMap } from 'immutable'
import { apiCallRequestRegexp, apiCallResponseRegexp } from './loader'

// In case selector can not find variable in state if defaultFalse = true it will return loading = false
export const loadingSelector = (
  requests: ImmutableMap<string, boolean>,
  actions: string[],
  noMatchMeansLoading: boolean = true
): boolean => {
  return actions.length === 0
    ? false
    : actions.some(type => {
        const apiCallRequestMatches = apiCallRequestRegexp.exec(type)
        const apiCallResponseMatches = apiCallResponseRegexp.exec(type)
        const reducedAction = apiCallRequestMatches
          ? apiCallRequestMatches[1]
          : apiCallResponseMatches
            ? apiCallResponseMatches[1]
            : ''

        const result = requests.findKey((_, mapKey) => reducedAction === mapKey)

        if (!result) {
          // If we get no key matches for our regexp we haven't sent an API call off yet
          // This is akin to loading given we have specified more than 0 actions
          return noMatchMeansLoading
        }

        return requests.get(result)
      })
}
