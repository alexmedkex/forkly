import DataAccess from '@komgo/data-access'
import * as config from 'config'

export const connectToDb = () => {
  const dbUrl = config.get('mongo.url').toString()

  DataAccess.setUrl(dbUrl)
  DataAccess.connect()
}
