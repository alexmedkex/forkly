import { SortDirection, ISortingParams } from '../store/common/types'
import { Location, History } from 'history'
import { stringify } from 'qs'

export const getSortingParamsFromUrl = (location: Location): ISortingParams => {
  const urlSearchParams = new URLSearchParams(location.search)
  const key = urlSearchParams.get('key')

  if (!key) {
    return null
  }

  const direction: SortDirection = urlSearchParams.get('direction') as SortDirection

  return {
    key,
    direction
  }
}

export const appendSortingParamsToUrl = (sort: ISortingParams, history: History, location: Location) => {
  history.replace(`${location.pathname}${stringify(sort, { addQueryPrefix: true })}`)
}
