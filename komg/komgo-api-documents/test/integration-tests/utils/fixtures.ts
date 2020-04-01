const Fixtures = require('node-mongodb-fixtures')

/**
 * Configuration for running fixtures
 */
export interface IFixturesConfig {
  dir: string
  filter: string
  mongoDbUrl: string
}

/**
 * Load specified fixtures in MongoDB.
 *
 * @param fixturesConfig fixtures configuration
 */
export async function runFixtures(fixturesConfig: IFixturesConfig): Promise<void> {
  const fixtures = new Fixtures({
    dir: fixturesConfig.dir,
    filter: fixturesConfig.filter
  })

  try {
    await fixtures.connect(fixturesConfig.mongoDbUrl)
    await fixtures.unload()
    await fixtures.load()
    await fixtures.disconnect()
  } catch (e) {
    fail(`Failed to load documents: ${JSON.stringify(e)}`)
  }
}
