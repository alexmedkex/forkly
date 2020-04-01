import { roleDescriptionValidation, permittedActionsValidation } from './RoleSchema'

describe('Role permission actions validation', () => {
  it('Should pass on correct data', () => {
    const permittedActions = [
      {
        product: {
          id: 'tradeFinance',
          label: 'tradeFinance'
        },
        action: {
          id: 'manageTrades',
          label: 'manageTrades'
        },
        permission: {
          id: 'crud',
          label: 'crud'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(true)
  })
  it('Should pass on correct data if permission is not required', () => {
    const permittedActions = [
      {
        product: {
          id: 'administration',
          label: 'administration'
        },
        action: {
          id: 'readPublicKeys',
          label: 'readPublicKeys'
        },
        permission: null
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(true)
  })
  it('Should pass on correct data if permission is not required', () => {
    const permittedActions = [
      {
        product: {
          id: 'administration',
          label: 'administration'
        },
        action: {
          id: 'readPublicKeys',
          label: 'readPublicKeys'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(true)
  })

  it('Should fail on incorrect product id', () => {
    const permittedActions = [
      {
        product: {
          id: 'incorrect',
          label: 'tradeFinance'
        },
        action: {
          id: 'manageTrades',
          label: 'manageTrades'
        },
        permission: {
          id: 'crud',
          label: 'crud'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(false)
  })

  it('Should fail on incorrect action id', () => {
    const permittedActions = [
      {
        product: {
          id: 'tradeFinance',
          label: 'tradeFinance'
        },
        action: {
          id: 'incorrect',
          label: 'manageTrades'
        },
        permission: {
          id: 'crud',
          label: 'crud'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(false)
  })

  it('Should fail on incorrect permission id', () => {
    const permittedActions = [
      {
        product: {
          id: 'tradeFinance',
          label: 'tradeFinance'
        },
        action: {
          id: 'manageTrades',
          label: 'manageTrades'
        },
        permission: {
          id: 'incorrect',
          label: 'crud'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(false)
  })

  it('Should fail on duplicates actions', () => {
    const permittedActions = [
      {
        product: {
          id: 'tradeFinance',
          label: 'tradeFinance'
        },
        action: {
          id: 'manageTrades',
          label: 'manageTrades'
        },
        permission: {
          id: 'incorrect',
          label: 'crud'
        }
      },
      {
        product: {
          id: 'tradeFinance',
          label: 'tradeFinance'
        },
        action: {
          id: 'manageTrades',
          label: 'manageTrades'
        },
        permission: {
          id: 'incorrect',
          label: 'read'
        }
      }
    ]
    expect(permittedActionsValidation(permittedActions)).toBe(false)
  })
})

describe('Role permision description validation', () => {
  it('Should pass on correct data', () => {
    expect(roleDescriptionValidation('Description')).toBe(true)
  })

  it('Should fail on empty description', () => {
    expect(roleDescriptionValidation('')).toBe(false)
  })
})
