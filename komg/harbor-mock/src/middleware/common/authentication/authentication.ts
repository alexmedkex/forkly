import * as express from 'express'
/**
 *  expressAuthentication intentionally does nothing.
 *  We only need Security annotations from tosa to mark routes with a scope an permissions so they are added to /swagger.json
 */
export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<null> {
  return Promise.resolve(null)
}
