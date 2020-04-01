import { getSortingParamsFromUrl } from './sortingUrl'
import { SortDirection } from '../store/common/types'

describe('sortingUrl', () => {
  describe('getSortingParamsFromUrl', () => {
    it('should resolve sorting data from url', () => {
      const mockLocation = {
        pathname: '',
        search: 'key=somekey&direction=ascending',
        state: '',
        hash: ''
      }

      const params = getSortingParamsFromUrl(mockLocation)
      expect(params).toEqual({ key: 'somekey', direction: SortDirection.Ascending })
    })

    it('should resolve null if key nor defined', () => {
      const mockLocation = {
        pathname: '',
        search: 'direction=ascending',
        state: '',
        hash: ''
      }

      const params = getSortingParamsFromUrl(mockLocation)
      expect(params).toBe(null)
    })
  })
})
