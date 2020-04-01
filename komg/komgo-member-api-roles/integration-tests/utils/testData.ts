import { v4 as uuid4 } from 'uuid'

export const tenantStaticIdHeaderName = 'X-Tenant-StaticID'

export const generateCreateRoleRequest = (roleLabel: string) => ({
  label: roleLabel,
  description: roleLabel,
  permittedActions: [
    {
      product: 'tradeFinance',
      action: 'manageTrades',
      permission: 'crud'
    }
  ]
})

export const generateRandomCreateRoleRequests = (num: number) => {
  const requests = []
  for (let i = 0; i < num; i++) {
    const tenantId = uuid4()
    requests.push({
      tenantId,
      data: generateCreateRoleRequest(tenantId),
      headers: {
        [tenantStaticIdHeaderName]: tenantId
      }
    })
  }

  return requests
}
