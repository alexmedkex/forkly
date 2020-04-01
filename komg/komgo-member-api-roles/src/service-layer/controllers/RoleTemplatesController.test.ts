import { RoleTemplatesController } from './RoleTemplatesController'
import { RoleDataAgent } from './__mocks__/RoleDataAgent'

describe('RoleTemplatesController', () => {
  it('returns array of all role templates', async () => {
    const controller = new RoleTemplatesController(new RoleDataAgent())
    controller.isKomgoNode = true
    const templates = await controller.GetTemplates()
    expect(templates).toBeInstanceOf(Array)
    expect(templates[0].actions.length).toBe(8)
    expect(templates[0].actions[0].komgoNodeOnly).toBe(undefined)
  })

  it('returns array of filtered role templates', async () => {
    const controller = new RoleTemplatesController(new RoleDataAgent())
    controller.isKomgoNode = false
    const templates = await controller.GetTemplates()
    expect(templates).toBeInstanceOf(Array)
    expect(templates[0].actions.length).toBe(5)
    expect(templates[0].actions[0].komgoNodeOnly).toBe(undefined)
  })
})
