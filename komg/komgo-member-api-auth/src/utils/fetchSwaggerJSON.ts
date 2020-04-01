import axios from 'axios'

export interface IWithPermissionSecurity {
  withPermission: string[]
}

export interface ISignedInSecurity {
  signedIn: undefined[]
}

export interface IInternalSecurity {
  internal: undefined[]
}

export type ISecurityObject = IWithPermissionSecurity & ISignedInSecurity & IInternalSecurity

export interface ISwaggerJSON {
  basePath: string
  paths: {
    [path: string]: {
      [method: string]: {
        security: ISecurityObject[]
      }
    }
  }
  securityDefinitions: {
    [key: string]: {
      type: string
      name: string
      in: string
    }
  }
  host: string
}

interface ICachedSwaggerMap {
  [baseUrl: string]: {
    expiresAt: number
    json: ISwaggerJSON
  }
}

export const fetchSwaggerJSON = async (baseUrl: string): Promise<ISwaggerJSON> => {
  const resp = await axios.get<ISwaggerJSON>(`${baseUrl}/swagger.json`, {
    responseType: 'json'
  })
  return resp.data
}

const cachedSwagger: ICachedSwaggerMap = {}
const defaultInterval = 30 // seconds
enum cache {
  FOREVER = -1,
  NEVER = 0
}

export const fetchCachedSwaggerJSON = async (baseUrl: string): Promise<ISwaggerJSON> => {
  const cacheInterval =
    process.env.SWAGGER_CACHE_INTERVAL === undefined || process.env.SWAGGER_CACHE_INTERVAL === ''
      ? defaultInterval
      : parseInt(process.env.SWAGGER_CACHE_INTERVAL, 10)

  const cached = cachedSwagger[baseUrl]
  if (cached && cacheInterval !== cache.NEVER && (cacheInterval === cache.FOREVER || cached.expiresAt > Date.now())) {
    return cached.json
  }

  const json = await fetchSwaggerJSON(baseUrl)
  cachedSwagger[baseUrl] = {
    json,
    expiresAt: Date.now() + cacheInterval * 1000
  }

  return json
}
