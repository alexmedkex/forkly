import { findSwaggerRouteByPath } from './findSwaggerRouteByPath'

describe('findSwaggerRouteByPath', () => {
  it('should return path if it is found', () => {
    expect(findSwaggerRouteByPath(['/users', '/test', '/documents'], '/test')).toEqual('/test')
  })

  it('should return path if it is found among parametrized paths', () => {
    expect(findSwaggerRouteByPath(['/users/{test}', '/test/{id}', '/documents/{test}'], '/test/users')).toEqual(
      '/test/{id}'
    )
  })

  it('should return undefined if path not found among parametrized paths', () => {
    expect(findSwaggerRouteByPath(['/users/{test}', '/test/{id}', '/documents/{test}'], '/files/test')).toEqual(
      undefined
    )
  })

  it('should give priority to exact match', () => {
    expect(findSwaggerRouteByPath(['/notif/{id}', '/notif/is-read'], '/notif/is-read')).toEqual('/notif/is-read')
  })
})
