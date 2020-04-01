import { IRequestIdHandler } from '@komgo/messaging-library'
import { createHook, HookCallbacks, executionAsyncId, AsyncHook } from 'async_hooks'
import { AxiosInstance } from 'axios'

import { generateRequestId } from './generation'

export const REQUEST_ID = 'requestId'
export const REQUEST_ID_HEADER = 'X-Request-ID'

export class RequestIdHandler implements IRequestIdHandler {
  private storage = new Map<number, object>()
  private listener: HookCallbacks
  private asyncHook: AsyncHook

  constructor() {
    this.listener = {
      init: (asyncId: number, type: string, triggerAsyncId: number) =>
        requestIdHandlerInstance.createContext(asyncId, triggerAsyncId),
      destroy: (asyncId: number) => requestIdHandlerInstance.destroyContext(asyncId)
    }

    this.asyncHook = createHook(this.listener)
    this.asyncHook.enable()
  }

  public set(value: string) {
    const id = executionAsyncId()
    if (!this.storage.has(id)) {
      this.storage.set(id, {})
    }
    this.storage.get(id)[REQUEST_ID] = value
  }

  public get(): string {
    const id = executionAsyncId()
    if (!this.storage.has(id)) {
      return undefined
    }
    return this.storage.get(id)[REQUEST_ID]
  }

  public generate() {
    this.set(generateRequestId())
  }

  public addToAxios(axios: AxiosInstance) {
    axios.interceptors.request.use(
      config => {
        const requestId = this.get()
        if (requestId) {
          config.headers[REQUEST_ID_HEADER] = requestId
        }
        return config
      },
      err => {
        return Promise.reject(err)
      }
    )
  }

  private createContext(asyncId: number, triggerAsyncId: number) {
    if (this.storage.has(triggerAsyncId)) {
      this.storage.set(asyncId, { ...this.storage.get(triggerAsyncId) })
    }
  }

  private destroyContext(asyncId = executionAsyncId()) {
    if (this.storage.has(asyncId)) {
      this.storage.delete(asyncId)
    }
  }
}

const requestIdHandlerInstance = new RequestIdHandler()

export default requestIdHandlerInstance
