import { ServerError } from '../types'
import { Map } from 'immutable'
import { typeRegexp } from '../reducers/errors'

export const findErrors = (errors: Map<string, ServerError>, actions: string[]): ServerError[] => {
  return actions.reduce<ServerError[]>((memo, action) => {
    const match = typeRegexp.exec(action) || []
    const [, key] = match
    return errors.get(key) ? [...memo, (errors.get(key) as any).toJS()] : memo
  }, [])
}
