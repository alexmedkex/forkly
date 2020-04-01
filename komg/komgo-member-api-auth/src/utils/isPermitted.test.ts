import isPermitted from './isPermitted'

describe('isPermitted()', () => {
  let axiosMock
  const isPermittedRequest = { roles: ['roleName'], permissions: ['permissionName'] }

  beforeAll(() => {
    process.env.API_ROLES_BASE_URL = 'http://api-roles'
    axiosMock = { post: jest.fn(() => ({ data: { isPermitted: false } })) }
  })

  it('should call axios.post with correct arguments', async () => {
    await isPermitted(axiosMock, isPermittedRequest)

    expect(axiosMock.post).toHaveBeenCalledWith('http://api-roles/v0/is-permitted', isPermittedRequest, {
      responseType: 'json'
    })
  })

  it('should return response.data', async () => {
    const resp = await isPermitted(axiosMock, isPermittedRequest)

    expect(resp).toEqual(false)
  })
})
