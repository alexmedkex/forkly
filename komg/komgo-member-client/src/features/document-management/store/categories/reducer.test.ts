import reducer, { initialState } from './reducer'
import { CategoryActionType, FetchCategoriesError } from '../types'
import { mockCategories } from './mock-data'

describe('Categories reducers', () => {
  const mockCategory = mockCategories[0]

  it('should default to initialState and ignore irrelevent actions', () => {
    // Arrange
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(initialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })
  it('should fetch the list of categories when FETCH_CATEGORIES_SUCCESS', () => {
    const action = {
      type: CategoryActionType.FETCH_CATEGORIES_SUCCESS,
      payload: [mockCategory]
    }
    // Act
    const expected = initialState.get('categories').concat(action.payload)
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('categories')).toEqual(expected)
  })
  it('should register an error in case FETCH_CATEGORIES_ERROR is thrown', () => {
    const expectedError = new Error('Error fetching categories')
    const action: FetchCategoriesError = {
      type: CategoryActionType.FETCH_CATEGORIES_ERROR,
      error: expectedError
    }
    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })
})
