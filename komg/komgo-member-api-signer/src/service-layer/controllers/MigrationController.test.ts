import 'jest'
import 'reflect-metadata'

import KeyMigration from '../../business-layer/migration/KeyMigration'
import { MigrationController } from '../controllers/MigrationController'

const keyMigration = {
  migrate: jest.fn()
}

describe('MigrationController', () => {
  let controller: MigrationController

  beforeEach(async () => {
    controller = new MigrationController(keyMigration as KeyMigration)
  })

  it('keyMigration should be called', async () => {
    await controller.migrate()
    expect(keyMigration.migrate).toBeCalledTimes(1)
  })
})
