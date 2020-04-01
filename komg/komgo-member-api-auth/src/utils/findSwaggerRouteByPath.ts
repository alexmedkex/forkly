import * as pathToRegexp from 'path-to-regexp'

/**
 * Returns path as defined in swagger.json that matches the requested path
 */
export const findSwaggerRouteByPath = (swaggerPaths: string[], requestedPath: string): string =>
  // prioritize a complete match just in case a microservice has both
  // a parametrized path and non-parametrized that have common prefix
  // Example:
  //   GET   /notifications/{notifId}
  //   PATCH /notifications/is-read
  swaggerPaths.find(path => path === requestedPath) ||
  // then search for a match in parametrized paths while replacing parameters like this:
  // '/notifications/{notifId}' is replaced with '/notifications/:notifId'
  // so we can use 'path-to-regexp' library
  swaggerPaths.find(path => {
    const fixedPath: string = path.replace(/[\{\}]/g, match => (match === '{' ? ':' : ''))
    return pathToRegexp(fixedPath).test(requestedPath)
  })
