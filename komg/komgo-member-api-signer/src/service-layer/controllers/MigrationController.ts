import { Controller, Post, Route, Tags } from 'tsoa'

import KeyMigration from '../../business-layer/migration/KeyMigration'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

@Tags('Migration')
@Route('migration')
@provideSingleton(MigrationController)
export class MigrationController extends Controller {
  /**
   *
   * @param oneTimeSigner
   * @param vaultClient
   */
  constructor(@inject(TYPES.KeyMigration) private readonly keyMigration: KeyMigration) {
    super()
  }

  /**
   *
   */
  @Post()
  public async migrate(): Promise<void> {
    await this.keyMigration.migrate()
  }
}
